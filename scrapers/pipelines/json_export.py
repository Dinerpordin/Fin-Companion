"""
json_export.py
==============
Scrapy pipeline that writes all scraped items to a dated JSONL file
in data/crawl_output/. Provides a local backup of every crawl run
independent of database availability.

Output format:
  data/crawl_output/<spider_name>_<YYYY-MM-DD>.jsonl

Each line is a JSON object (one per item).
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path


class JsonExportPipeline:
    """Writes each item to a JSONL file keyed by spider name and date."""

    def open_spider(self, spider):
        export_dir = spider.settings.get("JSON_EXPORT_DIR", "data/crawl_output")
        # Resolve relative to project root (two directories up from pipelines/)
        project_root = Path(__file__).resolve().parent.parent.parent
        output_dir = project_root / export_dir
        output_dir.mkdir(parents=True, exist_ok=True)

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        filename = output_dir / f"{spider.name}_{today}.jsonl"

        self._file = open(filename, "a", encoding="utf-8")
        spider.logger.info(f"[JsonExportPipeline] Writing to {filename}")

    def close_spider(self, spider):
        if hasattr(self, "_file") and self._file and not self._file.closed:
            self._file.flush()
            self._file.close()
            spider.logger.info("[JsonExportPipeline] File closed.")

    def process_item(self, item, spider):
        print(f"JSON EXPORT WRITING ITEM TO: {self.output_path}, item: {item}")
        line = json.dumps(dict(item), ensure_ascii=False, default=str)
        self._file.write(line + "\n")
        return item
