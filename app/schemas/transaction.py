from pydantic import BaseModel

class TransactionCreate(BaseModel):
    user_id: int
    amount: float
    location: str

class Transaction(BaseModel):
    id: int
    user_id: int
    amount: float
    location: str
    status: str

    class Config:
        from_attributes = True