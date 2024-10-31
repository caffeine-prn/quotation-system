from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.auth import get_current_active_user
from app.models.models import User
from app.core.backup_manager import BackupManager
from app.core.permissions import require_admin
import os

router = APIRouter()

backup_manager = BackupManager(
    bucket_name=os.getenv("S3_BUCKET_NAME"),
    aws_access_key=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region=os.getenv("AWS_REGION", "ap-northeast-2")
)

@router.post("/backups", response_model=dict)
async def create_backup(
    current_user: User = Depends(get_current_active_user)
):
    require_admin(current_user)
    
    try:
        backup_path = backup_manager.create_backup(
            db_name=os.getenv("DB_NAME"),
            db_user=os.getenv("DB_USER"),
            db_host=os.getenv("DB_HOST"),
            db_password=os.getenv("DB_PASSWORD")
        )
        return {"status": "success", "backup_path": backup_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backups", response_model=List[dict])
async def list_backups(
    current_user: User = Depends(get_current_active_user)
):
    require_admin(current_user)
    
    try:
        return backup_manager.list_backups()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/backups/restore/{backup_path}")
async def restore_backup(
    backup_path: str,
    current_user: User = Depends(get_current_active_user)
):
    require_admin(current_user)
    
    try:
        success = backup_manager.restore_backup(
            backup_path=backup_path,
            db_name=os.getenv("DB_NAME"),
            db_user=os.getenv("DB_USER"),
            db_host=os.getenv("DB_HOST"),
            db_password=os.getenv("DB_PASSWORD")
        )
        return {"status": "success" if success else "failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/backups/{backup_path}")
async def delete_backup(
    backup_path: str,
    current_user: User = Depends(get_current_active_user)
):
    require_admin(current_user)
    
    try:
        success = backup_manager.delete_backup(backup_path)
        return {"status": "success" if success else "failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))