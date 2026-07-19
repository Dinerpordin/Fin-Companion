"""
agent.py — Gemini AI response generator for the Financial Companion.

Uses the current `google-genai` SDK (google.genai) and gemini-2.0-flash.
The older `google.generativeai` package is deprecated and has been removed.

Guardrails enforced here:
- System prompt forbids personal financial advice.
- Response must be valid JSON.
- Raw user inputs are NEVER stored (enforced in caller).
"""

import json
import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

# Validate key at import time so we get a clear warning at startup
if not settings.GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in .env — AI companion will return fallback responses.")

SYSTEM_PROMPT = """
You are a financial information assistant for Bangladesh.
RULES:
1. NEVER give personalised financial advice. NEVER say what someone 'should' do.
2. Reply in plain, accessible Bangla (bn-BD).
3. Do not invent rates or fees.
4. Your response MUST be valid JSON matching this schema exactly:
{
  "intent": "loan_assessment|loan_simulation|product_comparison|nearest_provider|how_to_apply|health_snapshot|accounting_help|financial_education|fraud_awareness|social_planning|government_assistance|legal_rights|emergency_guide|insurance_info|remittance_guide|out_of_scope|general_chat",
  "reply_text_bn": "Your response in Bangla.",
  "reply_text_en": "Optional english translation or empty string",
  "next_actions": ["array of 2-3 suggested follow-up prompts in Bangla"]
}
"""


async def generate_response(prompt: str) -> dict:
    """Call Gemini and return a parsed response dict. Falls back gracefully."""
    if not settings.GEMINI_API_KEY:
        return _fallback_response("GEMINI_API_KEY not configured")

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
            ),
        )

        data = json.loads(response.text)

        # Normalise next_actions: API may return list[str] instead of list[dict]
        raw_actions = data.get("next_actions", [])
        if raw_actions and isinstance(raw_actions[0], str):
            data["next_actions"] = [
                {"type": "chat", "target": "/companion", "label_bn": a}
                for a in raw_actions
            ]

        return data

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned non-JSON response: {e}")
        return _fallback_response("Invalid JSON from model")
    except Exception as e:
        logger.error(f"Gemini API error: {e}", exc_info=True)
        return _fallback_response(str(e))


def _fallback_response(error: str) -> dict:
    logger.warning(f"Using fallback response. Reason: {error}")
    return {
        "intent": "general_chat",
        "reply_text_bn": "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।",
        "reply_text_en": f"Sorry, I cannot process your request right now. Error: {error}",
        "next_actions": [
            {"type": "chat", "target": "/companion", "label_bn": "ঋণ সম্পর্কে জানতে চাই"},
            {"type": "chat", "target": "/companion", "label_bn": "ডিপিএস সম্পর্কে জানতে চাই"},
        ],
    }
