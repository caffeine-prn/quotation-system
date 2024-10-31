import sys
import logging
import traceback
from mangum import Mangum

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)

try:
    logger.info("Importing app from app.main...")
    from app.main import app
    logger.info("App imported successfully")
    
    # Vercel serverless handler
    logger.info("Initializing Mangum handler...")
    handler = Mangum(app, lifespan="off")
    logger.info("Handler initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize handler: {str(e)}")
    logger.error(f"Traceback: {''.join(traceback.format_tb(e.__traceback__))}")
    logger.error(f"Python path: {sys.path}")
    raise