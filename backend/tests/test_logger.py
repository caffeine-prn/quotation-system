import pytest
import os
import json
from datetime import datetime, timedelta
from app.core.logger import SystemLogger

@pytest.fixture
def logger():
    # 테스트용 로그 파일 경로
    log_file = "test_logs/test_quotation_system.log"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # 테스트용 로거 생성
    logger = SystemLogger(
        es_url=None,  # 테스트에서는 Elasticsearch 사용하지 않음
        log_file=log_file
    )
    
    yield logger
    
    # 테스트 후 로그 파일 삭제
    if os.path.exists(log_file):
        os.remove(log_file)

def test_log_activity(logger):
    """활동 로깅 테스트"""
    # 테스트 로그 데이터
    test_data = {
        "user_id": 1,
        "action": "create_quotation",
        "resource": "quotations",
        "details": {"quotation_id": 123}
    }
    
    # 로그 기록
    logger.log_activity(**test_data)
    
    # 로그 파일 확인
    with open(logger.logger.handlers[0].baseFilename, 'r') as f:
        log_line = f.readlines()[-1]
        log_data = json.loads(log_line.split(' - ')[-1])
        
        assert log_data["user_id"] == test_data["user_id"]
        assert log_data["action"] == test_data["action"]
        assert log_data["resource"] == test_data["resource"]
        assert log_data["details"] == test_data["details"]

def test_log_levels(logger):
    """다양한 로그 레벨 테스트"""
    test_data = {
        "user_id": 1,
        "action": "test_action",
        "resource": "test_resource",
        "details": {}
    }
    
    # 다양한 레벨로 로깅
    logger.log_activity(**test_data, level="INFO")
    logger.log_activity(**test_data, level="WARNING")
    logger.log_activity(**test_data, level="ERROR")
    
    # 로그 파일 확인
    with open(logger.logger.handlers[0].baseFilename, 'r') as f:
        logs = f.readlines()
        assert len(logs) == 3
        assert "INFO" in logs[0]
        assert "WARNING" in logs[1]
        assert "ERROR" in logs[2]

def test_log_file_creation(logger):
    """로그 파일 생성 테스트"""
    logger.log_activity(
        user_id=1,
        action="test",
        resource="test",
        details={}
    )
    
    assert os.path.exists(logger.logger.handlers[0].baseFilename)

@pytest.mark.skipif(not os.getenv("ELASTICSEARCH_URL"), 
                   reason="Elasticsearch URL not configured")
def test_elasticsearch_logging():
    """Elasticsearch 로깅 테스트"""
    # Elasticsearch가 구성된 경우에만 실행
    logger = SystemLogger(
        es_url=os.getenv("ELASTICSEARCH_URL"),
        log_file="test_logs/test_es.log"
    )
    
    test_data = {
        "user_id": 1,
        "action": "test_es",
        "resource": "test",
        "details": {"test": True}
    }
    
    # 로그 기록
    logger.log_activity(**test_data)
    
    # 잠시 대기 (인덱싱 시간)
    import time
    time.sleep(1)
    
    # 로그 검색
    start_date = datetime.utcnow() - timedelta(minutes=1)
    end_date = datetime.utcnow() + timedelta(minutes=1)
    logs = logger.search_logs(
        start_date=start_date,
        end_date=end_date,
        filters={"action": "test_es"}
    )
    
    assert len(logs) > 0
    assert logs[0]["action"] == "test_es"
    assert logs[0]["user_id"] == 1