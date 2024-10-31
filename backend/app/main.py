import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import Settings
import sys
import traceback

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quotation-api")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)

settings = Settings()

try:
    app = FastAPI(
        title="Quotation System API",
        version="1.0.0",
        description="Quotation System Backend API"
    )

    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 개발 중에는 모든 origin 허용
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        return {"status": "ok", "message": "Quotation System API is running"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Exception occurred: {str(exc)}")
        logger.error(f"Traceback: {''.join(traceback.format_tb(exc.__traceback__))}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "type": str(type(exc).__name__)
            }
        )

    # API 라우터는 나중에 추가
    logger.info("FastAPI application initialized successfully")

except Exception as e:
    logger.error(f"Failed to initialize FastAPI application: {str(e)}")
    logger.error(f"Traceback: {''.join(traceback.format_tb(e.__traceback__))}")
    raise

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