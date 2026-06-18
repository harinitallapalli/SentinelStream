from pydantic import BaseModel

class ApiKeyCreate(BaseModel):
    key_name: str
