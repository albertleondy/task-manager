from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class BoardBase(BaseModel):
    """Base board schema."""
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("Board name must not be empty or whitespace only")
        return v.strip()


class BoardCreate(BoardBase):
    """Schema for creating a new board."""
    pass


class BoardResponse(BaseModel):
    """Schema for board response."""
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    task_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


