ADVISORY_TERMS = [
    "আপনার উচিত",
    "বিনিয়োগ করুন",
    "best for you",
    "i advise",
    "আমি পরামর্শ দিচ্ছি",
    "সবচেয়ে ভালো হবে",
    "আপনার জন্য সেরা",
    "নিশ্চিত লাভ",
]

def check_guardrails(text: str) -> bool:
    """
    Returns False if advisory language is detected in the LLM response.
    """
    if not text:
        return True

    # .lower() only affects the English-script advisory terms in ADVISORY_TERMS
    # (e.g. "best for you", "i advise"). Bangla Unicode codepoints have no
    # case distinction, so .lower() is a no-op for them. Both are checked
    # correctly via simple substring search.
    lower_text = text.lower()
    for term in ADVISORY_TERMS:
        if term in lower_text:
            return False
    return True
