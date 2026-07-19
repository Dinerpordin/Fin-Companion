"""
Unit tests for guardrail.check_guardrails().

Covers:
- Each Bangla advisory term triggers a False (unsafe) result
- English advisory terms work case-insensitively via .lower()
- A neutral Bangla reply returns True (safe)
- Edge cases: empty string, whitespace-only, term substring vs standalone
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.assistant.guardrail import check_guardrails, ADVISORY_TERMS


class TestAdvisoryTermsBlocked:
    """Every term in ADVISORY_TERMS must cause check_guardrails to return False."""

    def test_bangla_term_apnar_uchit(self):
        assert check_guardrails("আপনার উচিত এই ব্যাংকে যাওয়া") is False

    def test_bangla_term_biniog_korun(self):
        assert check_guardrails("এখানে বিনিয়োগ করুন এবং লাভ পান") is False

    def test_bangla_term_amader_paramersh(self):
        assert check_guardrails("আমি পরামর্শ দিচ্ছি আপনাকে এই পণ্যটি নিতে") is False

    def test_bangla_term_sobcheye_bhalo(self):
        assert check_guardrails("এটি আপনার জন্য সবচেয়ে ভালো হবে") is False

    def test_bangla_term_apnar_jonno_sera(self):
        assert check_guardrails("এটা আপনার জন্য সেরা পছন্দ") is False

    def test_bangla_term_nishchit_lab(self):
        assert check_guardrails("এখানে নিশ্চিত লাভ পাবেন") is False

    def test_english_best_for_you_lowercase(self):
        assert check_guardrails("This product is best for you") is False

    def test_english_best_for_you_uppercase(self):
        # .lower() converts this for matching
        assert check_guardrails("THIS IS BEST FOR YOU") is False

    def test_english_i_advise(self):
        assert check_guardrails("I advise you to take this loan") is False

    def test_english_i_advise_uppercase(self):
        assert check_guardrails("I ADVISE taking this product") is False


class TestSafeRepliesAllowed:
    """Neutral responses must return True (pass the guardrail)."""

    def test_factual_comparison_response(self):
        text = (
            "ব্র্যাক ব্যাংকের সুদের হার ৯% এবং ডাচ বাংলা ব্যাংকের সুদের হার ১০%। "
            "তুলনা দেখুন এবং নিজে সিদ্ধান্ত নিন।"
        )
        assert check_guardrails(text) is True

    def test_english_factual_response(self):
        text = "The interest rate at Bank X is 9.5% per annum for personal loans up to ৳500,000."
        assert check_guardrails(text) is True

    def test_empty_string_is_safe(self):
        assert check_guardrails("") is True

    def test_whitespace_only_is_safe(self):
        assert check_guardrails("   ") is True

    def test_disclaimer_response_is_safe(self):
        text = "এই তথ্য শুধুমাত্র তুলনার জন্য। এটি আর্থিক পরামর্শ নয়।"
        assert check_guardrails(text) is True


class TestAllAdvisoryTermsCovered:
    """Smoke test: every term in ADVISORY_TERMS should individually fail."""

    def test_all_advisory_terms_block(self):
        for term in ADVISORY_TERMS:
            result = check_guardrails(f"Some text with {term} in it")
            assert result is False, f"Expected False for term: {term!r}"
