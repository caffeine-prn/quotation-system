from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import User, UserCreate, UserUpdate
from app.services import user as user_service
from app.db.base import get_db
from app.core.auth import get_current_active_user, get_current_active_superuser
from app.core.permissions import require_permissions, Permission

router = APIRouter()

@router.get("/", response_model=List[User])
@require_permissions([Permission.MANAGE_USERS])
async def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve users. Only accessible by superusers.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user = user_service.update_user(db, current_user.id, user_in)
    return user

@router.get("/{user_id}", response_model=User)
@require_permissions([Permission.MANAGE_USERS])
async def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = user_service.get_user(db, user_id=user_id)
    if user == current_user:
        return user
    if not current_user.role == "admin":
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user

@router.put("/{user_id}", response_model=User)
@require_permissions([Permission.MANAGE_USERS])
async def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a user. Only accessible by superusers.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = user_service.update_user(db, user_id, user_in)
    return user