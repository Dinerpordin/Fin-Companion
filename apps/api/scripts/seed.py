import asyncio
import json
import os
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings
from app.core.models import Institution, Product, ProductRate, SourceRecord, Location, DocumentChecklist

# Setup async engine
engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def seed():
    # Load JSON data
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    data_dir = os.path.join(base_dir, "data", "seed")
    
    with open(os.path.join(data_dir, "institutions_bb_top10.json"), "r", encoding="utf-8") as f:
        institutions_data = json.load(f)
        
    with open(os.path.join(data_dir, "products_seed.json"), "r", encoding="utf-8") as f:
        products_data = json.load(f)

    with open(os.path.join(data_dir, "locations_seed.json"), "r", encoding="utf-8") as f:
        locations_data = json.load(f)

    with open(os.path.join(data_dir, "checklists_seed.json"), "r", encoding="utf-8") as f:
        checklists_data = json.load(f)

    async with SessionLocal() as session:
        # Create a dummy source record first
        dummy_source_id = uuid.uuid4()
        source = SourceRecord(
            id=dummy_source_id,
            source_url="https://www.bb.org.bd",
            source_type="seed",
            scraped_at=datetime.now(timezone.utc),
            status="active"
        )
        session.add(source)
        
        # Insert Institutions
        for item in institutions_data:
            inst = Institution(
                id=uuid.UUID(item["id"]),
                name_en=item["name_en"],
                name_bn=item["name_bn"],
                institution_type=item["institution_type"],
                regulator=item["regulator"],
                website_url=item["website_url"],
                phone_public=item["phone_public"],
                is_islamic=item["is_islamic"],
                last_verified_at=datetime.fromisoformat(item["last_verified_at"].replace("Z", "+00:00"))
            )
            await session.merge(inst) # Use merge to handle existing

        # Insert Products and Rates
        for item in products_data:
            prod = Product(
                id=uuid.UUID(item["id"]),
                institution_id=uuid.UUID(item["institution_id"]),
                category=item["category"],
                name_en=item["name_en"],
                name_bn=item["name_bn"],
                description_short_bn=item["description_short_bn"],
                min_amount=item["min_amount"],
                max_amount=item["max_amount"],
                min_tenor_months=item["min_tenor_months"],
                max_tenor_months=item["max_tenor_months"],
                islamic_flag=item["islamic_flag"],
                official_url=item["official_url"],
                status=item["status"]
            )
            await session.merge(prod)
            
            for rate in item.get("rates", []):
                pr = ProductRate(
                    id=uuid.UUID(rate["id"]),
                    product_id=uuid.UUID(item["id"]),
                    rate_type=rate["rate_type"],
                    nominal_rate=rate["nominal_rate"],
                    effective_notes=rate.get("effective_notes"),
                    valid_from=datetime.fromisoformat(rate["valid_from"].replace("Z", "+00:00")),
                    verified_at=datetime.fromisoformat(rate["verified_at"].replace("Z", "+00:00")),
                    confidence_flag=rate["confidence_flag"],
                    source_id=dummy_source_id
                )
                await session.merge(pr)

        # Insert Locations
        for item in locations_data:
            loc = Location(
                id=uuid.UUID(item["id"]),
                institution_id=uuid.UUID(item["institution_id"]),
                location_type=item["location_type"],
                branch_name=item["branch_name"],
                district=item["district"],
                upazila=item.get("upazila"),
                address_text=item.get("address_text"),
                latitude=item.get("latitude"),
                longitude=item.get("longitude"),
                products_supported=item.get("products_supported", []),
                phone_public=item.get("phone_public"),
                verified_at=datetime.fromisoformat(item["verified_at"].replace("Z", "+00:00")),
                source_url=item.get("source_url")
            )
            await session.merge(loc)

        # Insert Checklists
        for item in checklists_data:
            chk = DocumentChecklist(
                id=uuid.UUID(item["id"]),
                institution_id=uuid.UUID(item["institution_id"]) if item.get("institution_id") else None,
                product_category=item["product_category"],
                checklist_bn=item["checklist_bn"],
                checklist_en=item.get("checklist_en"),
                verified_at=datetime.fromisoformat(item["verified_at"].replace("Z", "+00:00")),
                source_id=None
            )
            await session.merge(chk)

        await session.commit()
        print("Successfully seeded the database!")

if __name__ == "__main__":
    asyncio.run(seed())
