import pytest
import os
from datetime import datetime
from app.core.backup_manager import BackupManager

@pytest.fixture
def backup_manager():
    # 테스트용 S3 설정
    return BackupManager(
        bucket_name=os.getenv("TEST_S3_BUCKET_NAME", "test-quotation-backups"),
        aws_access_key=os.getenv("TEST_AWS_ACCESS_KEY"),
        aws_secret_key=os.getenv("TEST_AWS_SECRET_KEY"),
        region=os.getenv("TEST_AWS_REGION", "ap-northeast-2")
    )

@pytest.mark.skipif(not os.getenv("TEST_AWS_ACCESS_KEY"),
                   reason="AWS credentials not configured for testing")
def test_create_backup(backup_manager):
    """백업 생성 테스트"""
    try:
        backup_path = backup_manager.create_backup(
            db_name="test_db",
            db_user="test_user",
            db_host="localhost"
        )
        
        assert backup_path.startswith("database_backups/backup_test_db_")
        assert backup_path.endswith(".sql")
        
    except Exception as e:
        pytest.fail(f"Failed to create backup: {str(e)}")

@pytest.mark.skipif(not os.getenv("TEST_AWS_ACCESS_KEY"),
                   reason="AWS credentials not configured for testing")
def test_list_backups(backup_manager):
    """백업 목록 조회 테스트"""
    try:
        # 테스트용 백업 생성
        backup_manager.create_backup(
            db_name="test_db",
            db_user="test_user",
            db_host="localhost"
        )
        
        # 백업 목록 조회
        backups = backup_manager.list_backups()
        
        assert len(backups) > 0
        assert "path" in backups[0]
        assert "size" in backups[0]
        assert "last_modified" in backups[0]
        
    except Exception as e:
        pytest.fail(f"Failed to list backups: {str(e)}")

@pytest.mark.skipif(not os.getenv("TEST_AWS_ACCESS_KEY"),
                   reason="AWS credentials not configured for testing")
def test_delete_backup(backup_manager):
    """백업 삭제 테스트"""
    try:
        # 테스트용 백업 생성
        backup_path = backup_manager.create_backup(
            db_name="test_db",
            db_user="test_user",
            db_host="localhost"
        )
        
        # 백업 삭제
        result = backup_manager.delete_backup(backup_path)
        assert result == True
        
        # 삭제 확인
        backups = backup_manager.list_backups()
        deleted_backup = [b for b in backups if b["path"] == backup_path]
        assert len(deleted_backup) == 0
        
    except Exception as e:
        pytest.fail(f"Failed to delete backup: {str(e)}")

@pytest.mark.skipif(not os.getenv("TEST_AWS_ACCESS_KEY"),
                   reason="AWS credentials not configured for testing")
def test_restore_backup(backup_manager):
    """백업 복원 테스트"""
    try:
        # 테스트용 백업 생성
        backup_path = backup_manager.create_backup(
            db_name="test_db",
            db_user="test_user",
            db_host="localhost"
        )
        
        # 백업 복원
        result = backup_manager.restore_backup(
            backup_path=backup_path,
            db_name="test_db_restored",
            db_user="test_user",
            db_host="localhost"
        )
        
        assert result == True
        
    except Exception as e:
        pytest.fail(f"Failed to restore backup: {str(e)}")

def test_backup_directory_creation(backup_manager):
    """백업 디렉토리 생성 테스트"""
    assert os.path.exists(backup_manager.backup_dir)

def test_invalid_credentials():
    """잘못된 자격 증명 테스트"""
    invalid_manager = BackupManager(
        bucket_name="invalid-bucket",
        aws_access_key="invalid-key",
        aws_secret_key="invalid-secret",
        region="ap-northeast-2"
    )
    
    with pytest.raises(Exception):
        invalid_manager.create_backup(
            db_name="test_db",
            db_user="test_user",
            db_host="localhost"
        )