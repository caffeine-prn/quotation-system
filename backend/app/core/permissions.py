from enum import Enum
from typing import List
from fastapi import HTTPException, status

class Role(str, Enum):
    ADMIN = "admin"
    PROJECT_MANAGER = "project_manager"
    MEDICAL_WRITER = "medical_writer"

class Permission(str, Enum):
    # User management
    MANAGE_USERS = "manage_users"
    
    # Company/Product management
    MANAGE_COMPANIES = "manage_companies"
    MANAGE_PRODUCTS = "manage_products"
    VIEW_COMPANIES = "view_companies"
    MANAGE_MEDIA_TYPES = "manage_media_types"
    VIEW_MEDIA_TYPES = "view_media_types"
    ASSIGN_PRODUCTS = "assign_products"
    
    # Price table management
    MANAGE_PRICE_TABLES = "manage_price_tables"
    VIEW_PRICE_TABLES = "view_price_tables"
    
    # Quotation management
    CREATE_QUOTATION = "create_quotation"
    EDIT_QUOTATION = "edit_quotation"
    VIEW_QUOTATION = "view_quotation"
    DELETE_QUOTATION = "delete_quotation"
    SHARE_QUOTATION = "share_quotation"

# Role-based permissions
ROLE_PERMISSIONS = {
    Role.ADMIN: [p.value for p in Permission],  # Admin has all permissions
    Role.PROJECT_MANAGER: [
        Permission.MANAGE_COMPANIES,
        Permission.MANAGE_PRODUCTS,
        Permission.VIEW_COMPANIES,
        Permission.MANAGE_PRICE_TABLES,
        Permission.VIEW_PRICE_TABLES,
        Permission.CREATE_QUOTATION,
        Permission.EDIT_QUOTATION,
        Permission.VIEW_QUOTATION,
        Permission.DELETE_QUOTATION,
        Permission.SHARE_QUOTATION,
    ],
    Role.MEDICAL_WRITER: [
        Permission.VIEW_COMPANIES,
        Permission.VIEW_PRICE_TABLES,
        Permission.VIEW_QUOTATION,
        Permission.EDIT_QUOTATION,
    ]
}

def check_permission(user_role: str, required_permission: str) -> bool:
    """Check if the user's role has the required permission."""
    if user_role not in ROLE_PERMISSIONS:
        return False
    return required_permission in ROLE_PERMISSIONS[user_role]

def require_permissions(required_permissions: List[str]):
    """Decorator for checking required permissions."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated"
                )
            
            for permission in required_permissions:
                if not check_permission(current_user.role, permission):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Permission denied: {permission}"
                    )
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_admin(func):
    """관리자 권한이 필요한 엔드포인트를 위한 데코레이터"""
    async def wrapper(*args, **kwargs):
        current_user = kwargs.get("current_user")
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        if current_user.role != Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin permission required"
            )
        return await func(*args, **kwargs)
    return wrapper