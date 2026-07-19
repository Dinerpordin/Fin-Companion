import asyncio
from app.routers.whatsapp import process_whatsapp_message

async def run_test():
    phone_number = "+8801700000000"
    text_message = "What is the best loan rate?"
    print(f"Sending message: {text_message}")
    response = await process_whatsapp_message(phone_number, text_message)
    print("Response:")
    print(response)

if __name__ == "__main__":
    asyncio.run(run_test())
