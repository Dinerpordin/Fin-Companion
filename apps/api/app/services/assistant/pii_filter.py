import re

def remove_pii(text: str) -> str:
    """
    Remove likely PII such as NID and Account numbers from user input.
    """
    if not text:
        return text
    # Remove 10, 13, 17 digit NID
    text = re.sub(r'\b\d{10}\b|\b\d{13}\b|\b\d{17}\b', '[NID REMOVED]', text)
    # Remove obvious account numbers (13-16 digits often used by banks)
    text = re.sub(r'\b\d{14,16}\b', '[ACCOUNT REMOVED]', text)
    return text
