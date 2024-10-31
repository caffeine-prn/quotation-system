import sys
import logging
from mangum import Mangum
from app.main import app

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)

try:
    # Vercel serverless handler
    handler = Mangum(app, lifespan="off")
    logger.info("Handler initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize handler: {str(e)}")
    raise