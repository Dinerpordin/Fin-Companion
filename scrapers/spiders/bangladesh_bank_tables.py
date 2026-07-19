import os
import scrapy
from datetime import datetime, timezone
import re

class BangladeshBankTablesSpider(scrapy.Spider):
    name = "bangladesh_bank_tables"
    allowed_domains = ["bb.org.bd"]
    start_urls = ["https://www.bb.org.bd/en/index.php/financialactivity/depositrates"]

    def __init__(self, local_path=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.local_path = local_path

    def start_requests(self):
        if self.local_path:
            abs_path = os.path.abspath(self.local_path)
            self.logger.info(f"Loading local HTML file from {abs_path}")
            yield scrapy.Request(url=f"file:///{abs_path}", callback=self.parse)
        else:
            for url in self.start_urls:
                yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        self.logger.info(f"Parsing response from {response.url}")
        
        # Check if we hit WAF block
        if "human visitor" in response.text or "captcha" in response.text.lower():
            self.logger.error("Web Application Firewall (CAPTCHA) block detected. Falling back or stopping.")
            return

        # Find tables
        tables = response.xpath("//table")
        self.logger.info(f"Found {len(tables)} tables")

        for table in tables:
            rows = table.xpath(".//tr")
            for row in rows:
                cells = row.xpath(".//td")
                if len(cells) < 2:
                    continue
                
                # Extract first column as bank name candidate
                bank_name_raw = "".join(cells[0].xpath(".//text()").getall()).strip()
                if not bank_name_raw:
                    continue

                # Clean bank name candidate
                bank_name = re.sub(r'\s+', ' ', bank_name_raw)

                # Look for rates in other cells
                for i, cell in enumerate(cells[1:]):
                    cell_text = "".join(cell.xpath(".//text()").getall()).strip()
                    # Look for numerical rates like "6.50", "6.5", "6"
                    match = re.search(r'(\d+(?:\.\d+)?)', cell_text)
                    if match:
                        try:
                            rate = float(match.group(1))
                            # Ignore 0 or exceptionally high/low rates
                            if 2.0 <= rate <= 20.0:
                                # Determine category/tenor based on index/header
                                # For a standard table, we default to 3-month fixed deposit
                                yield {
                                    "bank_name_raw": bank_name,
                                    "rate_type": "interest_rate",
                                    "nominal_rate": rate,
                                    "category": "fd",
                                    "tenor_months": 3,
                                    "source_url": response.url,
                                    "verified_at": datetime.now(timezone.utc).isoformat()
                                }
                        except ValueError:
                            continue
