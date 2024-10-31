from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    auth, users, companies, products, quotations, 
    price_tables, exports, version_control, backup
)
from app.core.logger import SystemLogger
import os

app = FastAPI(title="Quotation System API")

# 시스템 로거 초기화
logger = SystemLogger(
    es_url=os.getenv("ELASTICSEARCH_URL"),
    log_file="logs/quotation_system.log"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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