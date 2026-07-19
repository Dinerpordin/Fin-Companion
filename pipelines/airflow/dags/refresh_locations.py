"""
refresh_locations.py — Airflow DAG
====================================
Quarterly pipeline that refreshes branch and agent location data.

Current implementation uses a stub BashOperator that will be replaced
with a dedicated `bank_locations` Scrapy spider once the location
data sources are mapped.

Schedule: 00:00 UTC on the first day of every quarter (Jan, Apr, Jul, Oct).
"""

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.utils.trigger_rule import TriggerRule

SCRAPY_BASE = "cd /opt/airflow && python -m scrapy crawl"
DEFAULT_ARGS = {
    "owner": "data-team",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=15),
    "email_on_failure": False,
}

with DAG(
    dag_id="refresh_locations",
    default_args=DEFAULT_ARGS,
    description="Quarterly branch and agent-point location refresh",
    schedule_interval="0 0 1 1,4,7,10 *",   # Quarterly
    start_date=datetime(2026, 7, 1),
    catchup=False,
    tags=["locations", "quarterly"],
    doc_md=__doc__,
) as dag:

    # ------------------------------------------------------------------
    # Branch location crawl
    # When bank_locations spider is implemented, replace the echo with:
    #   f"{SCRAPY_BASE} bank_locations -s LOG_LEVEL=INFO"
    # ------------------------------------------------------------------
    run_locations_spider = BashOperator(
        task_id="run_locations_spider",
        bash_command=(
            f"{SCRAPY_BASE} bank_locations -s LOG_LEVEL=INFO"
        ),
    )

    # ------------------------------------------------------------------
    # Geo-enrichment: resolve district/upazila from raw address strings
    # Placeholder — will call a geocoding microservice once available
    # ------------------------------------------------------------------
    run_geo_enrichment = BashOperator(
        task_id="run_geo_enrichment",
        bash_command=(
            "echo 'Geo-enrichment step pending geocoding service integration.'"
        ),
    )

    # ------------------------------------------------------------------
    # Completion marker
    # ------------------------------------------------------------------
    def _log_completion(**context):
        print(
            f"[refresh_locations] DAG run '{context['run_id']}' "
            f"completed at {datetime.utcnow().isoformat()}Z"
        )

    notify_complete = PythonOperator(
        task_id="notify_complete",
        python_callable=_log_completion,
        trigger_rule=TriggerRule.ALL_DONE,
        provide_context=True,
    )

    # Task graph
    run_locations_spider >> run_geo_enrichment >> notify_complete
