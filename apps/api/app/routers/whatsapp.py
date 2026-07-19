"""
WhatsApp Channel Webhook router.
Connects the AI Financial Companion to the WhatsApp Business API.
"""

from fastapi import APIRouter, Request, BackgroundTasks
import logging

from app.services.assistant.pii_filter import remove_pii
from app.services.assistant.guardrail import check_guardrails
from app.services.assistant.agent import generate_response
from app.routers.assistant import DISCLAIMER_BN
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def process_whatsapp_message(phone_number: str, text_message: str):
    """Core logic to process and respond to a WhatsApp message."""
    logger.info(f"Processing WhatsApp message from {phone_number}")
    
    # 1. Strip PII
    safe_message = remove_pii(text_message)
    
    # 2. Get response from Gemini
    agent_output = await generate_response(safe_message)
    reply_bn = agent_output.get("reply_text_bn", "আমি বুঝতে পারিনি। (I didn't understand.)")
    
    # 3. Guardrails (reject advisory language)
    if not check_guardrails(reply_bn):
        reply_bn = "দুঃখিত, আমি ব্যক্তিগত আর্থিক পরামর্শ দিতে পারি না।"
        
    # 4. Format for WhatsApp (adding disclaimer)
    whatsapp_response = f"{reply_bn}\n\n_{DISCLAIMER_BN}_"
    
    # In a real production app, we would POST `whatsapp_response` to the Meta Graph API
    # or Twilio API here. For now, we simulate it via logs.
    logger.info(f"Sending WhatsApp response to {phone_number}: {whatsapp_response}")
    
    return whatsapp_response


@router.get("/whatsapp/webhook")
async def verify_webhook(request: Request):
    """
    Webhook verification for Meta Graph API.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    # Hardcoded token removed — now read from WHATSAPP_VERIFY_TOKEN env var.
    # If the env var is blank the webhook is effectively disabled (all verifications fail).
    if not settings.WHATSAPP_VERIFY_TOKEN:
        logger.warning(
            "WHATSAPP_VERIFY_TOKEN is not set — WhatsApp webhook verification is disabled."
        )
        return {"error": "Webhook verification is disabled (token not configured)"}
    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        return int(challenge)
    return {"error": "Invalid token"}


@router.post("/whatsapp/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Accept incoming messages from WhatsApp Business API (Meta).
    """
    payload = await request.json()
    
    try:
        # Parse Meta Graph API Payload
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                messages = value.get("messages", [])
                
                for message in messages:
                    if message.get("type") == "text":
                        phone_number = message.get("from")
                        text = message.get("text", {}).get("body", "")
                        
                        # Process in background so we return 200 OK immediately
                        background_tasks.add_task(process_whatsapp_message, phone_number, text)
                        
    except Exception as e:
        logger.error(f"Error parsing WhatsApp webhook: {e}")
        
    return {"status": "accepted"}


@router.post("/whatsapp/simulate")
async def simulate_webhook(message: str, phone_number: str = "+8801700000000"):
    """
    Test endpoint for local verification without a real WhatsApp account.
    Waits for the response instead of sending to background.
    """
    response = await process_whatsapp_message(phone_number, message)
    return {
        "phone_number": phone_number,
        "whatsapp_formatted_response": response
    }
