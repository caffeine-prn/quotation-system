import subprocess
from datetime import datetime
import boto3
import os
from typing import Optional, List
import logging
import json

class BackupManager:
    def __init__(self, 
                 bucket_name: str,
                 aws_access_key: str,
                 aws_secret_key: str,
                 region: str = "ap-northeast-2",
                 backup_dir: str = "/tmp/backups"):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )
        self.bucket_name = bucket_name
        self.backup_dir = backup_dir
        self.logger = logging.getLogger(__name__)
        
        # 백업 디렉토리 생성
        os.makedirs(self.backup_dir, exist_ok=True)
        
    def create_backup(self, 
                     db_name: str,
                     db_user: str,
                     db_host: str,
                     db_password: Optional[str] = None) -> str:
        """
        데이터베이스 백업을 생성하고 S3에 업로드합니다.
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(
            self.backup_dir, 
            f"backup_{db_name}_{timestamp}.sql"
        )
        
        try:
            # 환경 변수 설정
            env = os.environ.copy()
            if db_password:
                env["PGPASSWORD"] = db_password
            
            # DB 덤프 생성
            result = subprocess.run([
                'pg_dump',
                '-h', db_host,
                '-U', db_user,
                '-d', db_name,
                '-f', backup_file
            ], env=env, check=True, capture_output=True)
            
            # 백업 메타데이터 생성
            metadata = {
                "database": db_name,
                "timestamp": timestamp,
                "size": os.path.getsize(backup_file),
                "created_by": db_user
            }
            
            # S3에 업로드
            s3_path = f"database_backups/{os.path.basename(backup_file)}"
            self.s3.upload_file(
                backup_file,
                self.bucket_name,
                s3_path,
                ExtraArgs={"Metadata": json.dumps(metadata)}
            )
            
            self.logger.info(f"Backup created successfully: {s3_path}")
            
            # 로컬 파일 삭제
            os.remove(backup_file)
            
            return s3_path
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Backup creation failed: {e.stderr.decode()}")
            raise Exception(f"Backup creation failed: {e.stderr.decode()}")
        except Exception as e:
            self.logger.error(f"Backup process failed: {str(e)}")
            raise Exception(f"Backup process failed: {str(e)}")
    
    def restore_backup(self,
                      backup_path: str,
                      db_name: str,
                      db_user: str,
                      db_host: str,
                      db_password: Optional[str] = None) -> bool:
        """
        S3에서 백업을 다운로드하고 데이터베이스를 복원합니다.
        """
        local_file = os.path.join(
            self.backup_dir,
            os.path.basename(backup_path)
        )
        
        try:
            # S3에서 백업 파일 다운로드
            self.s3.download_file(
                self.bucket_name,
                backup_path,
                local_file
            )
            
            # 환경 변수 설정
            env = os.environ.copy()
            if db_password:
                env["PGPASSWORD"] = db_password
            
            # DB 복원
            result = subprocess.run([
                'psql',
                '-h', db_host,
                '-U', db_user,
                '-d', db_name,
                '-f', local_file
            ], env=env, check=True, capture_output=True)
            
            self.logger.info(f"Backup restored successfully: {backup_path}")
            
            # 로컬 파일 삭제
            os.remove(local_file)
            
            return True
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Restore failed: {e.stderr.decode()}")
            raise Exception(f"Restore failed: {e.stderr.decode()}")
        except Exception as e:
            self.logger.error(f"Restore process failed: {str(e)}")
            raise Exception(f"Restore process failed: {str(e)}")
            
    def list_backups(self) -> List[dict]:
        """
        사용 가능한 모든 백업 목록을 반환합니다.
        """
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix="database_backups/"
            )
            
            backups = []
            for obj in response.get("Contents", []):
                try:
                    # 메타데이터 조회
                    metadata_response = self.s3.head_object(
                        Bucket=self.bucket_name,
                        Key=obj["Key"]
                    )
                    metadata = json.loads(
                        metadata_response.get("Metadata", {}).get("metadata", "{}")
                    )
                    
                    backups.append({
                        "path": obj["Key"],
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"],
                        **metadata
                    })
                except Exception as e:
                    self.logger.warning(
                        f"Failed to get metadata for {obj['Key']}: {str(e)}"
                    )
            
            return backups
            
        except Exception as e:
            self.logger.error(f"Failed to list backups: {str(e)}")
            raise Exception(f"Failed to list backups: {str(e)}")
            
    def delete_backup(self, backup_path: str) -> bool:
        """
        지정된 백업을 삭제합니다.
        """
        try:
            self.s3.delete_object(
                Bucket=self.bucket_name,
                Key=backup_path
            )
            self.logger.info(f"Backup deleted successfully: {backup_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to delete backup: {str(e)}")
            raise Exception(f"Failed to delete backup: {str(e)}")