import logging
from elasticsearch import Elasticsearch
from datetime import datetime
from typing import Dict, Any, Optional
import json
import os

class SystemLogger:
    def __init__(self, 
                 es_url: Optional[str] = None,
                 log_file: str = "quotation_system.log"):
        self.logger = logging.getLogger("quotation_system")
        self.setup_logging(log_file)
        self.es = Elasticsearch([es_url]) if es_url else None
        
    def setup_logging(self, log_file: str):
        # 로그 디렉토리 생성
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # 파일 핸들러 설정
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        # 스트림 핸들러 추가 (콘솔 출력)
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
        self.logger.addHandler(stream_handler)
        self.logger.setLevel(logging.INFO)
        
    def log_activity(self, 
                    user_id: int, 
                    action: str, 
                    resource: str, 
                    details: Dict[str, Any],
                    level: str = "INFO"):
        """
        시스템 활동을 로깅합니다.
        파일과 Elasticsearch(설정된 경우)에 모두 기록됩니다.
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "details": details
        }
        
        # 로그 레벨에 따라 로깅
        log_method = getattr(self.logger, level.lower())
        log_method(json.dumps(log_entry))
        
        # Elasticsearch에 로깅 (설정된 경우)
        if self.es:
            try:
                self.es.index(
                    index=f"quotation_logs_{datetime.utcnow():%Y-%m}",
                    document=log_entry
                )
            except Exception as e:
                self.logger.error(f"Failed to log to Elasticsearch: {str(e)}")
    
    def search_logs(self,
                   start_date: datetime,
                   end_date: datetime,
                   filters: Dict[str, Any] = None) -> list:
        """
        로그를 검색합니다. Elasticsearch가 설정된 경우에만 사용 가능합니다.
        """
        if not self.es:
            raise Exception("Elasticsearch is not configured")
            
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "timestamp": {
                                    "gte": start_date.isoformat(),
                                    "lte": end_date.isoformat()
                                }
                            }
                        }
                    ]
                }
            }
        }
        
        # 필터 추가
        if filters:
            for key, value in filters.items():
                query["query"]["bool"]["must"].append(
                    {"match": {key: value}}
                )
                
        try:
            result = self.es.search(
                index=f"quotation_logs_*",
                body=query
            )
            return [hit["_source"] for hit in result["hits"]["hits"]]
        except Exception as e:
            self.logger.error(f"Failed to search logs: {str(e)}")
            return []