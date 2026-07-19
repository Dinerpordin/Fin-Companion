"""
Unit tests for pii_filter.remove_pii().

Covers:
- 10-digit NID removal
- 13-digit NID removal (most common format)
- 17-digit NID removal (new smart card)
- 14-16 digit account number removal
- Overlap: 14-digit number (caught by account regex after NID pass)
- Non-PII digits NOT stripped (e.g. BDT amounts, phone numbers, 4-digit years)
- Empty and None-like inputs pass through unchanged
"""
import sys
import os

# Allow imports from the apps/api root without installing the package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.assistant.pii_filter import remove_pii


class TestNIDRemoval:
    def test_10_digit_nid_is_removed(self):
        text = "আমার NID নম্বর 1234567890 এবং আমি ঋণ চাই"
        result = remove_pii(text)
        assert "1234567890" not in result
        assert "[NID REMOVED]" in result

    def test_13_digit_nid_is_removed(self):
        text = "My NID is 1234567890123 please verify"
        result = remove_pii(text)
        assert "1234567890123" not in result
        assert "[NID REMOVED]" in result

    def test_17_digit_nid_is_removed(self):
        text = "Smart card NID: 12345678901234567"
        result = remove_pii(text)
        assert "12345678901234567" not in result
        assert "[NID REMOVED]" in result

    def test_multiple_nids_in_one_text(self):
        text = "NID1: 1234567890 NID2: 1234567890123"
        result = remove_pii(text)
        assert "1234567890123" not in result
        # At least one NID REMOVED marker present
        assert "[NID REMOVED]" in result


class TestAccountNumberRemoval:
    def test_14_digit_account_removed(self):
        text = "Account number 12345678901234 at Dutch Bangla Bank"
        result = remove_pii(text)
        assert "12345678901234" not in result
        assert "REMOVED" in result

    def test_15_digit_account_removed(self):
        text = "My savings account: 123456789012345"
        result = remove_pii(text)
        assert "123456789012345" not in result

    def test_16_digit_account_removed(self):
        text = "Card number 1234567890123456 expired"
        result = remove_pii(text)
        assert "1234567890123456" not in result
        assert "REMOVED" in result


class TestNonPIIPreserved:
    def test_short_amounts_not_stripped(self):
        """BDT amounts like 10000, 50000 must not be removed."""
        text = "আমি 10000 টাকা ঋণ নিতে চাই"
        result = remove_pii(text)
        assert "10000" in result

    def test_phone_numbers_not_stripped(self):
        """11-digit BD mobile numbers like 01712345678 should NOT be stripped."""
        text = "Call me at 01712345678"
        result = remove_pii(text)
        # 11 digits — not in NID regex (10,13,17) or account regex (14-16)
        assert "01712345678" in result

    def test_year_not_stripped(self):
        """4-digit years like 2024 must not be removed."""
        text = "Opened in 2024"
        result = remove_pii(text)
        assert "2024" in result

    def test_empty_string_returns_empty(self):
        assert remove_pii("") == ""

    def test_text_without_pii_unchanged(self):
        text = "আমি একটি ঋণ তুলনা করতে চাই"
        result = remove_pii(text)
        assert result == text
