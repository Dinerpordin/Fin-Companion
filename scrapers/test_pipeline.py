import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone, timedelta
import uuid

# Mock the database availability before importing
with patch('scrapers.pipelines.db_publish.DB_AVAILABLE', True):
    from scrapers.pipelines.db_publish import DbPublishPipeline, _best_match

class TestDbPublishPipeline(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.pipeline = DbPublishPipeline()
        self.spider = MagicMock()
        self.spider.name = "bank_product_pages"
        self.spider.logger = MagicMock()

    def _setup_mock_session(self, mock_session_local):
        mock_session = AsyncMock()
        # session.add is synchronous in SQLAlchemy, make it MagicMock to avoid RuntimeWarnings
        mock_session.add = MagicMock()
        mock_session_local.return_value = mock_session
        mock_session.__aenter__.return_value = mock_session
        return mock_session

    def _create_mock_result(self, scalar_all_val=None, scalar_first_val=None):
        mock_res = MagicMock()
        if scalar_all_val is not None:
            mock_res.scalars.return_value.all.return_value = scalar_all_val
        if scalar_first_val is not None:
            mock_res.scalars.return_value.first.return_value = scalar_first_val
        else:
            mock_res.scalars.return_value.first.return_value = None
        return mock_res

    @patch('scrapers.pipelines.db_publish.AsyncSessionLocal')
    async def test_database_connection_fallback(self, mock_session_local):
        mock_session = AsyncMock()
        mock_session_local.return_value = mock_session
        mock_session.__aenter__.side_effect = Exception("DB Connection Error")

        item = {
            "bank_name_raw": "BRAC Bank",
            "nominal_rate": 6.5,
            "category": "fd",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "source_url": "https://example.com"
        }

        res = await self.pipeline.process_item(item, self.spider)

        self.assertTrue(self.pipeline.db_failed)
        self.assertEqual(res, item)
        self.spider.logger.critical.assert_called_with(
            "[CRITICAL] Database connection failed in DbPublishPipeline: DB Connection Error"
        )
        self.spider.logger.warning.assert_called_with(
            "[DRY RUN] Would publish rate: 6.5% for BRAC Bank (fd)"
        )

    @patch('scrapers.pipelines.db_publish.AsyncSessionLocal')
    @patch('scrapers.pipelines.db_publish._best_match')
    async def test_confidence_scoring_rules(self, mock_best_match, mock_session_local):
        mock_session = self._setup_mock_session(mock_session_local)

        mock_inst = MagicMock()
        mock_inst.id = uuid.uuid4()
        mock_inst.is_islamic = False
        mock_inst.name_en = "BRAC Bank"
        mock_best_match.return_value = mock_inst

        mock_product = MagicMock()
        mock_product.id = uuid.uuid4()
        mock_product.name_en = "BRAC Bank FD"

        # Mock execute returns:
        # 1. Institutions list (scalar)
        # 2. Product search
        # 3. SourceRecord search
        # 4. ProductRate history search (none)
        # 5. ProductRate conflict search (none)
        mock_execute_results = [
            self._create_mock_result(scalar_all_val=[mock_inst]),
            self._create_mock_result(scalar_first_val=mock_product),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=None),
        ]
        mock_session.execute.side_effect = mock_execute_results

        # High confidence rate (within 3.0%-15.0% and bank_product_pages spider)
        item = {
            "bank_name_raw": "BRAC Bank",
            "nominal_rate": 6.5,
            "category": "fd",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "source_url": "https://example.com"
        }

        await self.pipeline.process_item(item, self.spider)

        # Check the ProductRate object that was added
        added_objs = [args[0] for args, _ in mock_session.add.call_args_list]
        rate_objs = [o for o in added_objs if o.__class__.__name__ == "ProductRate"]
        self.assertTrue(len(rate_objs) > 0)
        self.assertEqual(rate_objs[0].confidence_flag, "high")

        # Medium confidence (rate outside 3.0%-15.0%)
        mock_session.execute.side_effect = [
            self._create_mock_result(scalar_all_val=[mock_inst]),
            self._create_mock_result(scalar_first_val=mock_product),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=None),
        ]
        mock_session.add.reset_mock()
        item["nominal_rate"] = 2.5
        await self.pipeline.process_item(item, self.spider)
        added_objs = [args[0] for args, _ in mock_session.add.call_args_list]
        rate_objs = [o for o in added_objs if o.__class__.__name__ == "ProductRate"]
        self.assertTrue(len(rate_objs) > 0)
        self.assertEqual(rate_objs[0].confidence_flag, "medium")

    @patch('scrapers.pipelines.db_publish.AsyncSessionLocal')
    @patch('scrapers.pipelines.db_publish._best_match')
    async def test_discrepancy_detection(self, mock_best_match, mock_session_local):
        mock_session = self._setup_mock_session(mock_session_local)

        mock_inst = MagicMock()
        mock_inst.id = uuid.uuid4()
        mock_inst.is_islamic = False
        mock_inst.name_en = "BRAC Bank"
        mock_best_match.return_value = mock_inst

        mock_product = MagicMock()
        mock_product.id = uuid.uuid4()
        mock_product.name_en = "BRAC Bank FD"

        mock_latest_rate = MagicMock()
        mock_latest_rate.nominal_rate = 6.0

        mock_execute_results = [
            self._create_mock_result(scalar_all_val=[mock_inst]),
            self._create_mock_result(scalar_first_val=mock_product),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=mock_latest_rate),
            self._create_mock_result(scalar_first_val=None),
        ]
        mock_session.execute.side_effect = mock_execute_results

        item = {
            "bank_name_raw": "BRAC Bank",
            "nominal_rate": 8.5,
            "category": "fd",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "source_url": "https://example.com"
        }

        await self.pipeline.process_item(item, self.spider)

        self.spider.logger.warning.assert_any_call(
            f"[DISCREPANCY] Significant rate change for product 'BRAC Bank FD' "
            f"(ID: {mock_product.id}). Old rate: 6.0%, New rate: 8.5%"
        )
        added_objs = [args[0] for args, _ in mock_session.add.call_args_list]
        rate_objs = [o for o in added_objs if o.__class__.__name__ == "ProductRate"]
        self.assertTrue(len(rate_objs) > 0)
        self.assertEqual(rate_objs[0].confidence_flag, "low")

    @patch('scrapers.pipelines.db_publish.AsyncSessionLocal')
    @patch('scrapers.pipelines.db_publish._best_match')
    async def test_cross_source_conflict(self, mock_best_match, mock_session_local):
        mock_session = self._setup_mock_session(mock_session_local)

        mock_inst = MagicMock()
        mock_inst.id = uuid.uuid4()
        mock_inst.is_islamic = False
        mock_inst.name_en = "BRAC Bank"
        mock_best_match.return_value = mock_inst

        mock_product = MagicMock()
        mock_product.id = uuid.uuid4()
        mock_product.name_en = "BRAC Bank FD"

        mock_other_source_rate = MagicMock()
        mock_other_source_rate.nominal_rate = 7.5
        mock_other_source_rate.source = MagicMock()
        mock_other_source_rate.source.source_type = "bb_table"

        mock_execute_results = [
            self._create_mock_result(scalar_all_val=[mock_inst]),
            self._create_mock_result(scalar_first_val=mock_product),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=None),
            self._create_mock_result(scalar_first_val=mock_other_source_rate),
        ]
        mock_session.execute.side_effect = mock_execute_results

        item = {
            "bank_name_raw": "BRAC Bank",
            "nominal_rate": 6.0,
            "category": "fd",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "source_url": "https://example.com"
        }

        await self.pipeline.process_item(item, self.spider)

        self.spider.logger.warning.assert_any_call(
            f"[DISCREPANCY] Cross-source conflict for product 'BRAC Bank FD' "
            f"(ID: {mock_product.id}). New rate (bank_product_page): 6.0%, "
            f"Other rate (bb_table): 7.5%"
        )
        added_objs = [args[0] for args, _ in mock_session.add.call_args_list]
        rate_objs = [o for o in added_objs if o.__class__.__name__ == "ProductRate"]
        self.assertTrue(len(rate_objs) > 0)
        self.assertEqual(rate_objs[0].confidence_flag, "low")

if __name__ == "__main__":
    unittest.main()
