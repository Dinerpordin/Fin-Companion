"""
bank_product_pages.py
=====================
Retail bank product-page spiders for the Bangladesh Financial Companion.

Supported banks (scraped from their official product pages):
  - BRAC Bank       – FD rates table
  - Dutch-Bangla    – Savings & FD rates
  - Islami Bank     – Mudaraba savings/FD
  - City Bank       – FD/savings table
  - Mutual Trust    – FD/savings table
  - Generic         – Heuristic fallback for any other bank page

Usage (Scrapy CLI):
  # Live crawl:
  scrapy crawl bank_product_pages -a bank_id=brac_bank

  # WAF-bypass with a locally saved HTML file:
  scrapy crawl bank_product_pages -a bank_id=brac_bank -a local_path=data/html/brac_fd.html

Each item yielded matches the DbPublishPipeline contract:
  {
      "bank_name_raw": str,
      "rate_type": "interest_rate" | "profit_rate",
      "nominal_rate": float,
      "category": "fd" | "savings" | "loan",
      "tenor_months": int | None,
      "source_url": str,
      "verified_at": ISO-8601 str,
  }
"""

import os
import re
from datetime import datetime, timezone

import scrapy


# ---------------------------------------------------------------------------
# Registry: bank_id → (start_url, parse_method_name)
# ---------------------------------------------------------------------------
BANK_REGISTRY = {
    "brac_bank": {
        "name": "BRAC Bank",
        "url": "https://www.bracbank.com/en/deposit-rates",
        "parser": "_parse_brac",
    },
    "dutch_bangla": {
        "name": "Dutch-Bangla Bank",
        "url": "https://www.dutchbanglabank.com/rate-and-charges/deposit-rate.html",
        "parser": "_parse_dutch_bangla",
    },
    "islami_bank": {
        "name": "Islami Bank Bangladesh",
        "url": "https://www.islamibankbd.com/page/view_notice.php",
        "parser": "_parse_islami_bank",
    },
    "city_bank": {
        "name": "The City Bank",
        "url": "https://www.thecitybank.com/rate-and-charges",
        "parser": "_parse_city_bank",
    },
    "mutual_trust": {
        "name": "Mutual Trust Bank",
        "url": "https://www.mutualtrustbank.com/rates",
        "parser": "_parse_mutual_trust",
    },
}

# Tenor keywords → months (used by generic + specific parsers)
TENOR_MAP = {
    "1 month": 1,   "1-month": 1,   "one month": 1,
    "2 month": 2,   "2-month": 2,   "two month": 2,
    "3 month": 3,   "3-month": 3,   "three month": 3,   "quarterly": 3,
    "6 month": 6,   "6-month": 6,   "six month": 6,     "half year": 6,
    "12 month": 12, "12-month": 12, "one year": 12,     "1 year": 12,
    "2 year": 24,   "24 month": 24, "two year": 24,
    "3 year": 36,   "36 month": 36, "three year": 36,
}

# Category keywords
CATEGORY_MAP = {
    "savings": "savings",
    "mudaraba": "savings",
    "dps": "savings",
    "fixed deposit": "fd",
    "term deposit": "fd",
    "fd": "fd",
    "fdr": "fd",
    "loan": "loan",
    "credit": "loan",
    "home loan": "loan",
    "sme loan": "loan",
}

RATE_VALID_MIN = 2.0
RATE_VALID_MAX = 20.0


def _detect_tenor(text: str) -> int | None:
    """Best-effort tenor (months) extraction from a cell or header string."""
    text_lower = text.lower()
    for phrase, months in sorted(TENOR_MAP.items(), key=lambda x: -len(x[0])):
        if phrase in text_lower:
            return months
    # Try raw digit patterns like "3M", "12M"
    m = re.search(r"(\d{1,2})\s*m(?:onth)?s?\b", text_lower)
    if m:
        return int(m.group(1))
    y = re.search(r"(\d)\s*y(?:ear)?s?\b", text_lower)
    if y:
        return int(y.group(1)) * 12
    return None


def _detect_category(text: str) -> str:
    """Guess product category from surrounding text."""
    text_lower = text.lower()
    for kw, cat in CATEGORY_MAP.items():
        if kw in text_lower:
            return cat
    return "fd"  # default assumption for rate tables


def _extract_rates_from_table(table, bank_name: str, source_url: str,
                               default_category: str = "fd",
                               default_tenor: int = 3,
                               rate_type: str = "interest_rate"):
    """
    Generic table parser. Expects rows with at least 2 cells.
    Returns a generator of rate items.
    """
    headers = [
        " ".join(th.xpath(".//text()").getall()).strip()
        for th in table.xpath(".//th")
    ]

    rows = table.xpath(".//tr")
    for row in rows:
        cells = row.xpath(".//td")
        if len(cells) < 2:
            continue

        row_label = " ".join(cells[0].xpath(".//text()").getall()).strip()
        row_label = re.sub(r"\s+", " ", row_label)
        if not row_label:
            continue

        # Try each subsequent cell as a rate value
        for col_idx, cell in enumerate(cells[1:], start=1):
            cell_text = " ".join(cell.xpath(".//text()").getall()).strip()
            rate_match = re.search(r"(\d{1,2}(?:\.\d{1,2})?)\s*%?", cell_text)
            if not rate_match:
                continue
            try:
                rate = float(rate_match.group(1))
            except ValueError:
                continue
            if not (RATE_VALID_MIN <= rate <= RATE_VALID_MAX):
                continue

            # Determine tenor from header or row label
            header_text = headers[col_idx] if col_idx < len(headers) else ""
            tenor = (
                _detect_tenor(header_text)
                or _detect_tenor(row_label)
                or default_tenor
            )
            category = _detect_category(row_label) or default_category

            yield {
                "bank_name_raw": bank_name,
                "rate_type": rate_type,
                "nominal_rate": rate,
                "category": category,
                "tenor_months": tenor,
                "source_url": source_url,
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }


# ---------------------------------------------------------------------------
# Spider
# ---------------------------------------------------------------------------

class BankProductPagesSpider(scrapy.Spider):
    name = "bank_product_pages"

    def __init__(self, bank_id=None, local_path=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bank_id = bank_id
        self.local_path = local_path

        if bank_id and bank_id not in BANK_REGISTRY:
            raise ValueError(
                f"Unknown bank_id '{bank_id}'. "
                f"Valid options: {list(BANK_REGISTRY.keys())}"
            )

    # ------------------------------------------------------------------
    # Request generation
    # ------------------------------------------------------------------

    def start_requests(self):
        banks_to_crawl = (
            [self.bank_id]
            if self.bank_id
            else list(BANK_REGISTRY.keys())
        )

        for bid in banks_to_crawl:
            bank = BANK_REGISTRY[bid]
            if self.local_path:
                abs_path = os.path.abspath(self.local_path)
                url = f"file:///{abs_path}"
                self.logger.info(f"[{bid}] Loading local HTML from {abs_path}")
            else:
                url = bank["url"]
                self.logger.info(f"[{bid}] Crawling {url}")

            yield scrapy.Request(
                url=url,
                callback=getattr(self, bank["parser"]),
                cb_kwargs={"bank_id": bid},
                errback=self._handle_error,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"
                    ),
                    "Accept-Language": "en-US,en;q=0.9",
                },
            )

    def _handle_error(self, failure):
        self.logger.error(
            f"Request failed: {failure.request.url} — {failure.value}"
        )

    # ------------------------------------------------------------------
    # BRAC Bank parser
    # Deposit rates page: table with tenor headers and a single rate column
    # ------------------------------------------------------------------

    def _parse_brac(self, response, bank_id="brac_bank"):
        bank = BANK_REGISTRY[bank_id]
        self.logger.info(f"[brac_bank] Parsing {response.url}")

        if self._is_blocked(response):
            return

        # BRAC Bank typically uses a single structured table
        for table in response.xpath("//table"):
            yield from _extract_rates_from_table(
                table,
                bank_name=bank["name"],
                source_url=response.url,
                default_category="fd",
                default_tenor=3,
                rate_type="interest_rate",
            )

    # ------------------------------------------------------------------
    # Dutch-Bangla Bank parser
    # Uses separate sections for Savings and FD
    # ------------------------------------------------------------------

    def _parse_dutch_bangla(self, response, bank_id="dutch_bangla"):
        bank = BANK_REGISTRY[bank_id]
        self.logger.info(f"[dutch_bangla] Parsing {response.url}")

        if self._is_blocked(response):
            return

        # Sections are usually titled with h2/h3
        for section in response.xpath("//div[contains(@class,'rate')]|//section"):
            heading = " ".join(
                section.xpath(".//h2|.//h3").xpath(".//text()").getall()
            ).strip().lower()
            category = _detect_category(heading) if heading else "fd"

            for table in section.xpath(".//table"):
                yield from _extract_rates_from_table(
                    table,
                    bank_name=bank["name"],
                    source_url=response.url,
                    default_category=category,
                    default_tenor=3,
                    rate_type="interest_rate",
                )

        # Fallback: scan all tables in the page
        if not response.xpath("//div[contains(@class,'rate')]|//section"):
            for table in response.xpath("//table"):
                yield from _extract_rates_from_table(
                    table,
                    bank_name=bank["name"],
                    source_url=response.url,
                    default_category="fd",
                    rate_type="interest_rate",
                )

    # ------------------------------------------------------------------
    # Islami Bank Bangladesh parser
    # Islamic bank: uses "profit_rate" instead of "interest_rate"
    # ------------------------------------------------------------------

    def _parse_islami_bank(self, response, bank_id="islami_bank"):
        bank = BANK_REGISTRY[bank_id]
        self.logger.info(f"[islami_bank] Parsing {response.url}")

        if self._is_blocked(response):
            return

        for table in response.xpath("//table"):
            yield from _extract_rates_from_table(
                table,
                bank_name=bank["name"],
                source_url=response.url,
                default_category="savings",
                default_tenor=3,
                rate_type="profit_rate",   # Islamic designation
            )

    # ------------------------------------------------------------------
    # City Bank parser
    # ------------------------------------------------------------------

    def _parse_city_bank(self, response, bank_id="city_bank"):
        bank = BANK_REGISTRY[bank_id]
        self.logger.info(f"[city_bank] Parsing {response.url}")

        if self._is_blocked(response):
            return

        for table in response.xpath("//table"):
            yield from _extract_rates_from_table(
                table,
                bank_name=bank["name"],
                source_url=response.url,
                default_category="fd",
                default_tenor=12,
                rate_type="interest_rate",
            )

    # ------------------------------------------------------------------
    # Mutual Trust Bank parser
    # ------------------------------------------------------------------

    def _parse_mutual_trust(self, response, bank_id="mutual_trust"):
        bank = BANK_REGISTRY[bank_id]
        self.logger.info(f"[mutual_trust] Parsing {response.url}")

        if self._is_blocked(response):
            return

        for table in response.xpath("//table"):
            yield from _extract_rates_from_table(
                table,
                bank_name=bank["name"],
                source_url=response.url,
                default_category="fd",
                default_tenor=6,
                rate_type="interest_rate",
            )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _is_blocked(self, response) -> bool:
        blocked = (
            "human visitor" in response.text
            or "captcha" in response.text.lower()
            or "access denied" in response.text.lower()
            or response.status in (403, 429)
        )
        if blocked:
            self.logger.warning(
                f"WAF/CAPTCHA block detected for {response.url}. "
                "Use -a local_path=<file> to bypass."
            )
        return blocked
