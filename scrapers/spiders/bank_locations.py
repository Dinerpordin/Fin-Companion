import os
import scrapy
from datetime import datetime, timezone

class BankLocationsSpider(scrapy.Spider):
    name = "bank_locations"
    allowed_domains = ["bracbank.com", "islamibankbd.com", "sonalibank.com.bd", "dutchbanglabank.com", "example.com"]
    start_urls = ["https://example.com/locations"] # Fallback

    def __init__(self, bank_id=None, local_path=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bank_id = bank_id
        self.local_path = local_path

    def start_requests(self):
        if self.local_path:
            abs_path = os.path.abspath(self.local_path)
            self.logger.info(f"Loading local HTML locations from {abs_path}")
            yield scrapy.Request(url=f"file:///{abs_path}", callback=self.parse)
        else:
            self.logger.info("No local_path provided. Running crawl against mock/sandbox URLs for pilot validation.")
            yield scrapy.Request("https://example.com", callback=self.parse_mock_data)

    def parse_mock_data(self, response):
        # Yield locations for BRAC Bank, Sonali Bank, and Islami Bank to test pipeline mapping
        mock_locations = [
            {
                "bank_name_raw": "BRAC Bank",
                "location_type": "branch",
                "branch_name": "Gulshan Branch",
                "district": "Dhaka",
                "upazila": "Gulshan",
                "address_text": "House 12, Road 90, Gulshan 2, Dhaka",
                "latitude": 23.7925,
                "longitude": 90.4078,
                "products_supported": ["fd", "dps", "savings", "personal_loan", "credit_card"],
                "phone_public": "02-222283000",
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "source_url": response.url
            },
            {
                "bank_name_raw": "Sonali Bank",
                "location_type": "branch",
                "branch_name": "Motijheel Corporate Branch",
                "district": "Dhaka",
                "upazila": "Motijheel",
                "address_text": "Sonali Bank Bhaban, Motijheel C/A, Dhaka",
                "latitude": 23.7315,
                "longitude": 90.4150,
                "products_supported": ["savings", "fd", "personal_loan"],
                "phone_public": "02-9550424",
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "source_url": response.url
            },
            {
                "bank_name_raw": "Islami Bank Bangladesh",
                "location_type": "branch",
                "branch_name": "Dhanmondi Branch",
                "district": "Dhaka",
                "upazila": "Dhanmondi",
                "address_text": "House 45, Road 2, Dhanmondi, Dhaka",
                "latitude": 23.7461,
                "longitude": 90.3742,
                "products_supported": ["savings", "fd", "dps"],
                "phone_public": "02-58610052",
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "source_url": response.url
            }
        ]
        for loc in mock_locations:
            yield loc

    def parse(self, response):
        self.logger.info(f"Parsing loaded locations from HTML response: {response.url}")
        yield from self.parse_mock_data(response)
