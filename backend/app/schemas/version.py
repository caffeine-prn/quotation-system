from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional

class VersionBase(BaseModel):
    changes: Dict[str, Any]

class VersionCreate(VersionBase):
    pass

class VersionResponse(VersionBase):
    id: int
    quotation_id: int
    version_number: int
    created_at: datetime
    created_by: int

    class Config:
        orm_mode = True