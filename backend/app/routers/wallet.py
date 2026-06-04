from fastapi import APIRouter
from pydantic import BaseModel
from app.services.wallet_google import generate_signed_save_url

router = APIRouter()

class WalletGoogleRequest(BaseModel):
    ticketId: str

@router.post("/google")
def create_google_wallet(payload: WalletGoogleRequest) -> dict:
    return generate_signed_save_url(payload.ticketId)
