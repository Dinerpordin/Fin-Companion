# scrapers/settings.py
# =====================
# Scrapy project settings for the Bangladesh Financial Companion scrapers.

BOT_NAME = 'scrapers'
SPIDER_MODULES = ['scrapers.spiders']
NEWSPIDER_MODULE = 'scrapers.spiders'

# Respect robots.txt by default; override per-run with -s ROBOTSTXT_OBEY=False
ROBOTSTXT_OBEY = True

# Polite crawl: reduce load on bank servers
DOWNLOAD_DELAY = 2           # seconds between requests to same domain
CONCURRENT_REQUESTS = 4      # overall concurrency
CONCURRENT_REQUESTS_PER_DOMAIN = 1

# Retry settings
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 429]

# Default user agent (overridden per-spider for WAF bypass)
USER_AGENT = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/124.0.0.0 Safari/537.36'
)

# Cookie handling
COOKIES_ENABLED = False   # stateless scraping; enable per-spider if needed

# AutoThrottle — automatically adapts download speed
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1.0
AUTOTHROTTLE_MAX_DELAY = 10.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0

# Item pipelines (priority order: lower number = runs first)
# 200: JSON file export (local backup of all scraped items)
# 300: Database publish (async SQLAlchemy → Supabase PostgreSQL)
ITEM_PIPELINES = {
    'scrapy.pipelines.files.FilesPipeline': 1,          # built-in, disabled by default
    'scrapers.pipelines.json_export.JsonExportPipeline': 200,
    'scrapers.pipelines.db_publish.DbPublishPipeline': 300,
}

# JSON export output directory (relative to project root)
JSON_EXPORT_DIR = 'data/crawl_output'

# Twisted reactor must be asyncio for async SQLAlchemy in DbPublishPipeline
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'

# Logging
LOG_LEVEL = 'INFO'
