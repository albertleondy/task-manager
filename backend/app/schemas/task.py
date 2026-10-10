from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    """Base task schema."""
    title: str
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("Task title must not be empty or whitespace only")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            v_stripped = v.strip()
            return v_stripped if v_stripped else None
        return v


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    status: Optional[TaskStatus] = TaskStatus.TODO


class TaskUpdate(BaseModel):
    """Schema for updating task status or details (PATCH /api/tasks/{taskId})."""
    status: Optional[TaskStatus] = None
    title: Optional[str] = None
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_optional_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not isinstance(v, str) or not v.strip():
                raise ValueError("Task title must not be empty or whitespace only")
            return v.strip()
        return v

    @field_validator("description")
    @classmethod
    def validate_optional_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            v_stripped = v.strip()
            return v_stripped if v_stripped else None
        return v


class TaskResponse(BaseModel):
    """Schema for task response."""
    id: int
    board_id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

