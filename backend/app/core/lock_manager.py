import redis
from fastapi import HTTPException
from datetime import datetime
from typing import Optional
import json

class LockManager:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = redis.from_url(redis_url)
        self.lock_timeout = 300  # 5 minutes
        
    async def acquire_lock(self, resource_id: str, user_id: str) -> bool:
        """
        리소스에 대한 락을 획득합니다.
        이미 락이 있다면 현재 사용자의 락인지 확인합니다.
        """
        lock_key = f"lock:{resource_id}"
        
        # 현재 락 상태 확인
        current_lock = self.redis_client.get(lock_key)
        if current_lock:
            lock_data = json.loads(current_lock.decode('utf-8'))
            if lock_data['user_id'] != user_id:
                raise HTTPException(
                    status_code=423,
                    detail={
                        "message": "Resource is locked by another user",
                        "locked_by": lock_data['user_id'],
                        "locked_at": lock_data['locked_at']
                    }
                )
            
        # 새로운 락 설정
        lock_data = {
            "user_id": user_id,
            "locked_at": datetime.utcnow().isoformat()
        }
        self.redis_client.setex(
            lock_key,
            self.lock_timeout,
            json.dumps(lock_data)
        )
        return True
        
    async def release_lock(self, resource_id: str, user_id: str) -> bool:
        """
        리소스의 락을 해제합니다.
        현재 사용자의 락인 경우에만 해제가 가능합니다.
        """
        lock_key = f"lock:{resource_id}"
        current_lock = self.redis_client.get(lock_key)
        
        if current_lock:
            lock_data = json.loads(current_lock.decode('utf-8'))
            if lock_data['user_id'] == user_id:
                self.redis_client.delete(lock_key)
                return True
        return False

    async def get_lock_info(self, resource_id: str) -> Optional[dict]:
        """
        리소스의 현재 락 정보를 조회합니다.
        """
        lock_key = f"lock:{resource_id}"
        current_lock = self.redis_client.get(lock_key)
        
        if current_lock:
            return json.loads(current_lock.decode('utf-8'))
        return None