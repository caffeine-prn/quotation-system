import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.base import Base
from app.main import app
from app.db.base import get_db
import os
import redis

# 테스트용 데이터베이스 URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# 테스트용 데이터베이스 엔진 생성
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    # 테스트용 데이터베이스 생성
    Base.metadata.create_all(bind=engine)
    
    # 테스트용 세션 생성
    db = TestingSessionLocal()
    
    # 의존성 오버라이드
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield db
    
    # 테스트 후 cleanup
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def redis_client():
    # 테스트용 Redis 클라이언트
    client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=1  # 테스트용 DB 번호
    )
    
    yield client
    
    # 테스트 후 cleanup
    client.flushdb()
    client.close()

@pytest.fixture
def test_app():
    return app

@pytest.fixture(autouse=True)
def setup_env():
    """테스트에 필요한 환경 변수 설정"""
    os.environ["ELASTICSEARCH_URL"] = "http://localhost:9200"
    os.environ["AWS_ACCESS_KEY_ID"] = "test_key"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "test_secret"
    os.environ["AWS_REGION"] = "ap-northeast-2"
    os.environ["S3_BUCKET_NAME"] = "test-quotation-backups"
    yield
    # 테스트 후 환경 변수 제거
    for key in ["ELASTICSEARCH_URL", "AWS_ACCESS_KEY_ID", 
               "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "S3_BUCKET_NAME"]:
        os.environ.pop(key, None)