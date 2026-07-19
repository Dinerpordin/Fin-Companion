import os
import json

base_dir = r"c:\Dev_Projects\Financial Companion"

# Dirs to create
dirs = [
    "scrapers",
    "scrapers/spiders",
    "scrapers/parsers",
    "scrapers/pipelines",
    "data/seed",
    "pipelines/airflow/dags"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

# Scrapy config
scrapy_cfg = """[settings]
default = scrapers.settings

[deploy]
#url = http://localhost:6800/
project = scrapers
"""
with open(os.path.join(base_dir, "scrapy.cfg"), "w", encoding="utf-8") as f:
    f.write(scrapy_cfg)

with open(os.path.join(base_dir, "scrapers", "settings.py"), "w", encoding="utf-8") as f:
    f.write("BOT_NAME = 'scrapers'\nSPIDER_MODULES = ['scrapers.spiders']\nNEWSPIDER_MODULE = 'scrapers.spiders'\nROBOTSTXT_OBEY = True\nITEM_PIPELINES = {'scrapers.pipelines.db_publish.DbPublishPipeline': 300}\n")

with open(os.path.join(base_dir, "scrapers", "pipelines", "db_publish.py"), "w", encoding="utf-8") as f:
    f.write('class DbPublishPipeline:\n    def process_item(self, item, spider):\n        return item\n')

# Spiders
bb_spider = """import scrapy

class BangladeshBankTablesSpider(scrapy.Spider):
    name = "bangladesh_bank_tables"
    allowed_domains = ["bb.org.bd"]
    start_urls = ["https://www.bb.org.bd/en/index.php/financialactivity/depositrates"]

    def parse(self, response):
        pass
"""
with open(os.path.join(base_dir, "scrapers", "spiders", "bangladesh_bank_tables.py"), "w", encoding="utf-8") as f:
    f.write(bb_spider)

bank_spider = """import scrapy

class BankProductPagesSpider(scrapy.Spider):
    name = "bank_product_pages"

    def __init__(self, bank_id=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bank_id = bank_id

    def start_requests(self):
        # Would load URLs based on bank_id
        yield scrapy.Request("https://example.com", self.parse)

    def parse(self, response):
        pass
"""
with open(os.path.join(base_dir, "scrapers", "spiders", "bank_product_pages.py"), "w", encoding="utf-8") as f:
    f.write(bank_spider)

# Seed Data
institutions = [
    {
        "id": "1",
        "name_en": "Sonali Bank",
        "name_bn": "সোনালী ব্যাংক",
        "type": "state_owned",
        "head_office_address": "Motijheel, Dhaka",
        "contact_phone": "16639"
    },
    {
        "id": "2",
        "name_en": "Islami Bank Bangladesh",
        "name_bn": "ইসলামী ব্যাংক বাংলাদেশ",
        "type": "private_islamic",
        "head_office_address": "Dilkusha, Dhaka",
        "contact_phone": "16259"
    },
    {
        "id": "3",
        "name_en": "BRAC Bank",
        "name_bn": "ব্র্যাক ব্যাংক",
        "type": "private_commercial",
        "head_office_address": "Tejgaon, Dhaka",
        "contact_phone": "16221"
    }
]
with open(os.path.join(base_dir, "data", "seed", "institutions_bb_top10.json"), "w", encoding="utf-8") as f:
    json.dump(institutions, f, indent=2, ensure_ascii=False)

products = [
    {
        "id": "101",
        "institution_id": "3",
        "name_en": "BRAC Bank Fixed Deposit",
        "name_bn": "ব্র্যাক ব্যাংক ফিক্সড ডিপোজিট",
        "category": "fd",
        "islamic_flag": False,
        "source_url": "https://www.bracbank.com/en/retail/deposits/fixed-deposit",
        "last_verified_at": "2026-05-30T00:00:00Z"
    }
]
with open(os.path.join(base_dir, "data", "seed", "products_seed.json"), "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

# Airflow DAGs
refresh_rates = """from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'refresh_rates',
    default_args=default_args,
    description='Run Scrapy spiders to refresh deposit and loan rates',
    schedule_interval='@monthly',
    start_date=datetime(2026, 5, 30),
    catchup=False,
) as dag:

    run_bb_scraper = BashOperator(
        task_id='run_bb_scraper',
        bash_command='cd /opt/airflow/scrapers && scrapy crawl bangladesh_bank_tables'
    )
"""
with open(os.path.join(base_dir, "pipelines", "airflow", "dags", "refresh_rates.py"), "w", encoding="utf-8") as f:
    f.write(refresh_rates)

refresh_locations = """from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

with DAG(
    'refresh_locations',
    description='Quarterly branch refresh',
    schedule_interval='0 0 1 */3 *', # Quarterly
    start_date=datetime(2026, 5, 30),
    catchup=False,
) as dag:
    run_locations_scraper = BashOperator(
        task_id='run_locations_scraper',
        bash_command='echo "Refreshing locations"'
    )
"""
with open(os.path.join(base_dir, "pipelines", "airflow", "dags", "refresh_locations.py"), "w", encoding="utf-8") as f:
    f.write(refresh_locations)

print("Scaffolded Sprint 8")
