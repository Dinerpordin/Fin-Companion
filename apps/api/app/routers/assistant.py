"""
AI Financial Companion router.
Guardrails:
- No personalised financial advice
- Every response includes disclaimer_bn
- Loan numbers come from deterministic calculator only
- Product facts come from verified DB records only
- Raw inputs are NOT stored
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal

from app.services.assistant.pii_filter import remove_pii
from app.services.assistant.guardrail import check_guardrails
from app.services.assistant.agent import generate_response

router = APIRouter()

DISCLAIMER_BN = "এটি শুধু তথ্য প্রদান করে। এটি ব্যক্তিগত আর্থিক পরামর্শ নয়। কোনো সিদ্ধান্ত নেওয়ার আগে বিশেষজ্ঞের পরামর্শ নিন।"
DISCLAIMER_EN = "This provides information only and is not personal financial advice. Please consult a professional before making financial decisions."


class AssistantContext(BaseModel):
    district: Optional[str] = None
    upazila: Optional[str] = None


class AssistantRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=128)
    locale: Literal["bn-BD", "en"] = "bn-BD"
    message: str = Field(..., min_length=1, max_length=2000)
    channel: Literal["web_text", "web_voice"] = "web_text"
    context: Optional[AssistantContext] = None


class NextAction(BaseModel):
    type: str
    target: str
    label_bn: str


class AssistantResponse(BaseModel):
    intent: str
    reply_text_bn: str
    reply_text_en: Optional[str] = None
    disclaimer_bn: str = DISCLAIMER_BN
    disclaimer_en: str = DISCLAIMER_EN
    next_actions: list[NextAction] = []
    structured_payload: dict = {}


@router.post("/assistant/message", response_model=AssistantResponse)
async def send_message(req: AssistantRequest):
    """
    AI Financial Companion endpoint using Gemini 1.5 Flash.
    """
    # 1. Strip PII
    safe_message = remove_pii(req.message)
    
    # 2. Get response from Gemini
    agent_output = await generate_response(safe_message)
    
    reply_bn = agent_output.get("reply_text_bn", "আমি বুঝতে পারিনি।")
    
    # 3. Guardrails (reject advisory language)
    if not check_guardrails(reply_bn):
        return AssistantResponse(
            intent="out_of_scope",
            reply_text_bn="দুঃখিত, আমি ব্যক্তিগত আর্থিক পরামর্শ দিতে পারি না।",
            reply_text_en="Sorry, I cannot provide personal financial advice.",
            next_actions=[]
        )
        
    next_actions = []
    for action in agent_output.get("next_actions", []):
        if isinstance(action, dict):
            next_actions.append(NextAction(
                type=action.get("type", "prompt"),
                target=action.get("target", "/companion"),
                label_bn=action.get("label_bn", "")
            ))
        else:
            next_actions.append(NextAction(type="prompt", target=str(action), label_bn=str(action)))
        
    return AssistantResponse(
        intent=agent_output.get("intent", "general_chat"),
        reply_text_bn=reply_bn,
        reply_text_en=agent_output.get("reply_text_en"),
        next_actions=next_actions
    )
