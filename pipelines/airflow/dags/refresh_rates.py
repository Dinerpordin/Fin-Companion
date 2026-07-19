"""
refresh_rates.py — Airflow DAG
================================
Monthly pipeline that runs all configured Scrapy spiders to refresh
deposit, savings and loan rates in the database.

Schedule: first day of every month at 02:00 UTC.

Tasks (in dependency order):
  run_bb_spider → run_brac_spider  ┐
                → run_dbbl_spider  ├→ notify_complete
                → run_islami_spider┘
"""

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.utils.trigger_rule import TriggerRule

# ---------------------------------------------------------------------------
# Shared defaults
# ---------------------------------------------------------------------------
SCRAPY_BASE = "cd /opt/airflow && python -m scrapy crawl"
DEFAULT_ARGS = {
    "owner": "data-team",
    "depends_on_past": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=10),
    "email_on_failure": False,
}

# ---------------------------------------------------------------------------
# DAG definition
# ---------------------------------------------------------------------------
with DAG(
    dag_id="refresh_rates",
    default_args=DEFAULT_ARGS,
    description="Monthly scrape of deposit & loan rates from Bangladesh Bank and retail banks",
    schedule_interval="0 2 1 * *",   # Monthly, 02:00 UTC on the 1st
    start_date=datetime(2026, 6, 1),
    catchup=False,
    tags=["rates", "scrapy", "monthly"],
    doc_md=__doc__,
) as dag:

    # ------------------------------------------------------------------
    # Bangladesh Bank — regulatory deposit rate tables
    # ------------------------------------------------------------------
    run_bb_spider = BashOperator(
        task_id="run_bb_spider",
        bash_command=(
            f"{SCRAPY_BASE} bangladesh_bank_tables "
            "-s ROBOTSTXT_OBEY=False "
            "-s LOG_LEVEL=INFO"
        ),
    )

    # ------------------------------------------------------------------
    # Retail bank product pages (parallel after BB spider completes)
    # ------------------------------------------------------------------
    run_brac_spider = BashOperator(
        task_id="run_brac_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_product_pages "
            "-a bank_id=brac_bank "
            "-s LOG_LEVEL=INFO"
        ),
    )

    run_dbbl_spider = BashOperator(
        task_id="run_dbbl_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_product_pages "
            "-a bank_id=dutch_bangla "
            "-s LOG_LEVEL=INFO"
        ),
    )

    run_islami_spider = BashOperator(
        task_id="run_islami_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_product_pages "
            "-a bank_id=islami_bank "
            "-s LOG_LEVEL=INFO"
        ),
    )

    run_city_spider = BashOperator(
        task_id="run_city_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_product_pages "
            "-a bank_id=city_bank "
            "-s LOG_LEVEL=INFO"
        ),
    )

    run_mtb_spider = BashOperator(
        task_id="run_mtb_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_product_pages "
            "-a bank_id=mutual_trust "
            "-s LOG_LEVEL=INFO"
        ),
    )

    # ------------------------------------------------------------------
    # Completion marker (runs even if some spiders soft-fail)
    # ------------------------------------------------------------------
    def _log_completion(**context):
        run_id = context["run_id"]
        print(f"[refresh_rates] DAG run '{run_id}' completed at {datetime.utcnow().isoformat()}Z")

    notify_complete = PythonOperator(
        task_id="notify_complete",
        python_callable=_log_completion,
        trigger_rule=TriggerRule.ALL_DONE,  # run even if a bank spider fails
        provide_context=True,
    )

    # ------------------------------------------------------------------
    # Task dependency graph
    # ------------------------------------------------------------------
    #   run_bb_spider → [retail spiders] → notify_complete
    run_bb_spider >> [
        run_brac_spider,
        run_dbbl_spider,
        run_islami_spider,
        run_city_spider,
        run_mtb_spider,
    ] >> notify_complete
