from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import (
    auth, users, companies, products, quotations, 
    price_tables, exports, version_control, backup
)
from app.core.config import Settings
import os

settings = Settings()
app = FastAPI(
    title="Quotation System API",
    version="1.0.0",
    description="Quotation System Backend API"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://quotation-system-frontend.vercel.app",
        "https://quotation-system-53dr.vercel.app",
        "*"  # 개발 중에는 모든 origin 허용
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# API 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(quotations.router, prefix="/api/quotations", tags=["quotations"])
app.include_router(price_tables.router, prefix="/api/price-tables", tags=["price_tables"])
app.include_router(exports.router, prefix="/api", tags=["exports"])
app.include_router(version_control.router, prefix="/api", tags=["version_control"])
app.include_router(backup.router, prefix="/api", tags=["backup"])

@app.get("/")
async def root():
    return {"message": "Welcome to Quotation System API"}