"""
db_publish.py
=============
Scrapy item pipeline — persists crawled rate/fee items to the Supabase
PostgreSQL database via async SQLAlchemy.

Fuzzy matching strategy
-----------------------
1. Exact substring match (fast path).
2. Token-set ratio from `rapidfuzz` (handles word-order variation and
   abbreviations like "BRAC Bank Ltd" ↔ "BRAC Bank").
3. Acronym match: "MTB" → "Mutual Trust Bank".

The threshold (FUZZY_THRESHOLD) can be lowered for broader matching or raised
for stricter matching. Currently set to 75 out of 100.
"""

import sys
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy.future import select

# Add apps/api to Python path dynamically
sys.path.append(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "apps", "api")
)

try:
    from app.core.database import AsyncSessionLocal
    from app.core.models import Institution, Product, ProductRate, SourceRecord, Location
    DB_AVAILABLE = True
except ImportError:
    AsyncSessionLocal = None
    DB_AVAILABLE = False
    logging.getLogger(__name__).warning(
        "Database models not importable. DbPublishPipeline will run in dry-run mode."
    )

try:
    from rapidfuzz import fuzz
    FUZZY_AVAILABLE = True
except ImportError:
    FUZZY_AVAILABLE = False
    logging.getLogger(__name__).warning(
        "rapidfuzz not installed — falling back to substring matching only. "
        "Install with: pip install rapidfuzz"
    )

FUZZY_THRESHOLD = 75   # 0-100; lower = more permissive


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_acronym(name: str) -> str:
    """'Mutual Trust Bank Limited' → 'mtbl'"""
    words = re.sub(r"[^a-zA-Z\s]", "", name).split()
    return "".join(w[0] for w in words if w).lower()


import re


def _best_match(raw_name: str, institutions) -> "Institution | None":
    """
    Find the best matching Institution for *raw_name* using a cascade of
    matching strategies.
    """
    raw_lower = raw_name.lower().strip()

    # --- Pass 1: exact substring -------------------------------------------
    for inst in institutions:
        en_lower = inst.name_en.lower()
        bn = inst.name_bn or ""
        if (
            en_lower in raw_lower
            or raw_lower in en_lower
            or (bn and bn in raw_lower)
        ):
            return inst

    # --- Pass 2: fuzzy token-set ratio (rapidfuzz) -------------------------
    if FUZZY_AVAILABLE:
        scored = []
        for inst in institutions:
            score = fuzz.token_set_ratio(raw_lower, inst.name_en.lower())
            scored.append((score, inst))
        scored.sort(key=lambda x: -x[0])
        if scored and scored[0][0] >= FUZZY_THRESHOLD:
            return scored[0][1]

    # --- Pass 3: acronym match ---------------------------------------------
    raw_acronym = re.sub(r"[^a-z]", "", raw_lower)
    for inst in institutions:
        if _make_acronym(inst.name_en) == raw_acronym:
            return inst

    return None


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

class DbPublishPipeline:
    """
    Async Scrapy item pipeline.
    Writes each scraped rate item to the database:
      Institution → Product (upsert) → SourceRecord → ProductRate (insert)
    """

    def __init__(self):
        self.db_failed = False

    def _log_dry_run(self, item, spider):
        if "location_type" in item:
            spider.logger.warning(
                f"[DRY RUN] Would publish location: {item.get('branch_name')} "
                f"for {item.get('bank_name_raw')}"
            )
        else:
            spider.logger.warning(
                f"[DRY RUN] Would publish rate: {item.get('nominal_rate')}% "
                f"for {item.get('bank_name_raw')} ({item.get('category')})"
            )

    async def process_item(self, item, spider):
        if not DB_AVAILABLE or self.db_failed:
            self._log_dry_run(item, spider)
            return item

        # Check if this is a location item
        if "location_type" in item:
            try:
                async with AsyncSessionLocal() as session:
                    result = await session.execute(select(Institution))
                    institutions = result.scalars().all()
                    target_inst = _best_match(item["bank_name_raw"], institutions)
                    if not target_inst:
                        spider.logger.debug(
                            f"No matching institution for location '{item['bank_name_raw']}'. Skipping."
                        )
                        return item

                    # Check if location already exists
                    loc_q = select(Location).where(
                        Location.institution_id == target_inst.id,
                        Location.branch_name == item["branch_name"],
                        Location.location_type == item["location_type"]
                    )
                    result = await session.execute(loc_q)
                    db_loc = result.scalars().first()

                    if not db_loc:
                        db_loc = Location(
                            id=uuid.uuid4(),
                            institution_id=target_inst.id,
                            location_type=item["location_type"],
                            branch_name=item["branch_name"],
                            district=item["district"],
                            upazila=item.get("upazila"),
                            address_text=item.get("address_text"),
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            products_supported=item.get("products_supported", []),
                            phone_public=item.get("phone_public"),
                            verified_at=datetime.fromisoformat(item["verified_at"]),
                            source_url=item.get("source_url")
                        )
                        session.add(db_loc)
                        spider.logger.info(f"Created new location: {db_loc.branch_name} for {target_inst.name_en}")
                    else:
                        db_loc.district = item["district"]
                        db_loc.upazila = item.get("upazila")
                        db_loc.address_text = item.get("address_text")
                        db_loc.latitude = item.get("latitude")
                        db_loc.longitude = item.get("longitude")
                        db_loc.products_supported = item.get("products_supported", [])
                        db_loc.phone_public = item.get("phone_public")
                        db_loc.verified_at = datetime.fromisoformat(item["verified_at"])
                        db_loc.source_url = item.get("source_url")
                        spider.logger.info(f"Updated existing location: {db_loc.branch_name} for {target_inst.name_en}")

                    target_inst.last_verified_at = datetime.fromisoformat(item["verified_at"])
                    session.add(target_inst)
                    await session.commit()
            except Exception as e:
                spider.logger.critical(f"[CRITICAL] Database connection failed in DbPublishPipeline: {e}")
                self.db_failed = True
                self._log_dry_run(item, spider)
                return item
            return item

        try:
            async with AsyncSessionLocal() as session:
                # ----------------------------------------------------------
                # 1. Institution lookup (fuzzy)
                # ----------------------------------------------------------
                result = await session.execute(select(Institution))
                institutions = result.scalars().all()

                target_inst = _best_match(item["bank_name_raw"], institutions)

                if not target_inst:
                    spider.logger.debug(
                        f"No matching institution for '{item['bank_name_raw']}' "
                        f"(tried {len(institutions)} candidates). Skipping."
                    )
                    return item

                spider.logger.debug(
                    f"Matched '{item['bank_name_raw']}' → '{target_inst.name_en}'"
                )

                # ----------------------------------------------------------
                # 2. Product — look up or create
                # ----------------------------------------------------------
                prod_q = select(Product).where(
                    Product.institution_id == target_inst.id,
                    Product.category == item["category"],
                )
                result = await session.execute(prod_q)
                product = result.scalars().first()

                if not product:
                    rate_type_label = (
                        "মুনাফা" if item.get("rate_type") == "profit_rate" else "সুদ"
                    )
                    category_bn_map = {
                        "fd": "ফিক্সড ডিপোজিট",
                        "savings": "সঞ্চয় আমানত",
                        "loan": "ঋণ",
                    }
                    cat_bn = category_bn_map.get(item["category"], item["category"])
                    product = Product(
                        id=uuid.uuid4(),
                        institution_id=target_inst.id,
                        category=item["category"],
                        name_en=f"{target_inst.name_en} {item['category'].upper()}",
                        name_bn=f"{target_inst.name_bn} {cat_bn}",
                        islamic_flag=target_inst.is_islamic,
                        status="active",
                    )
                    session.add(product)
                    await session.flush()
                    spider.logger.info(
                        f"Created new product: {product.name_en}"
                    )

                # ----------------------------------------------------------
                # 3. SourceRecord — upsert by URL
                # ----------------------------------------------------------
                src_q = select(SourceRecord).where(
                    SourceRecord.source_url == item["source_url"]
                )
                result = await session.execute(src_q)
                source = result.scalars().first()

                source_type = "bank_product_page"
                if spider.name == "bangladesh_bank_tables":
                    source_type = "bb_table"

                if not source:
                    source = SourceRecord(
                        id=uuid.uuid4(),
                        source_url=item["source_url"],
                        source_type=item.get("source_type", source_type),
                        scraped_at=datetime.now(timezone.utc),
                        parser_version="1.0",
                        status="active",
                    )
                    session.add(source)
                    await session.flush()

                # ----------------------------------------------------------
                # 3.5 Discrepancy & Confidence scoring rules
                # ----------------------------------------------------------
                confidence = "medium"
                if spider.name == "bank_product_pages" and (3.0 <= item["nominal_rate"] <= 15.0):
                    confidence = "high"

                # Check 1: Historical rate change threshold (>= 2.0%)
                rate_q = select(ProductRate).where(
                    ProductRate.product_id == product.id
                ).order_by(ProductRate.verified_at.desc()).limit(1)
                result = await session.execute(rate_q)
                latest_rate_record = result.scalars().first()

                if latest_rate_record:
                    diff = abs(item["nominal_rate"] - latest_rate_record.nominal_rate)
                    if diff >= 2.0:
                        spider.logger.warning(
                            f"[DISCREPANCY] Significant rate change for product '{product.name_en}' "
                            f"(ID: {product.id}). Old rate: {latest_rate_record.nominal_rate}%, "
                            f"New rate: {item['nominal_rate']}%"
                        )
                        confidence = "low"

                # Check 2: Cross-source conflict (>= 1.0% within last 30 days)
                cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
                conflict_q = select(ProductRate).join(SourceRecord).where(
                    ProductRate.product_id == product.id,
                    SourceRecord.source_type != source_type,
                    ProductRate.verified_at >= cutoff_date
                ).order_by(ProductRate.verified_at.desc()).limit(1)
                result = await session.execute(conflict_q)
                other_source_rate = result.scalars().first()

                if other_source_rate:
                    diff = abs(item["nominal_rate"] - other_source_rate.nominal_rate)
                    if diff >= 1.0:
                        spider.logger.warning(
                            f"[DISCREPANCY] Cross-source conflict for product '{product.name_en}' "
                            f"(ID: {product.id}). New rate ({source_type}): {item['nominal_rate']}%, "
                            f"Other rate ({other_source_rate.source.source_type}): {other_source_rate.nominal_rate}%"
                        )
                        confidence = "low"

                # ----------------------------------------------------------
                # 4. ProductRate — always insert (historical record)
                # ----------------------------------------------------------
                new_rate = ProductRate(
                    id=uuid.uuid4(),
                    product_id=product.id,
                    rate_type=item.get("rate_type", "interest_rate"),
                    nominal_rate=item["nominal_rate"],
                    effective_notes=(
                        f"{item.get('tenor_months', '?')} month(s) — "
                        f"crawled from {item['source_url']}"
                    ),
                    valid_from=datetime.now(timezone.utc),
                    verified_at=datetime.fromisoformat(item["verified_at"]),
                    source_id=source.id,
                    confidence_flag=confidence,
                )
                session.add(new_rate)

                target_inst.last_verified_at = datetime.fromisoformat(item["verified_at"])
                session.add(target_inst)
                await session.commit()

                spider.logger.info(
                    f"Published {item['nominal_rate']}% for "
                    f"{target_inst.name_en} ({item['category']}, "
                    f"{item.get('tenor_months')}m) [Confidence: {confidence}]"
                )

        except Exception as e:
            spider.logger.critical(f"[CRITICAL] Database connection failed in DbPublishPipeline: {e}")
            self.db_failed = True
            self._log_dry_run(item, spider)
            return item

        return item

