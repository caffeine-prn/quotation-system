import pytest
import asyncio
from fastapi import HTTPException
from app.core.lock_manager import LockManager

@pytest.fixture
def lock_manager():
    return LockManager(redis_url="redis://localhost:6379")

@pytest.mark.asyncio
async def test_acquire_lock(lock_manager):
    """락 획득 테스트"""
    resource_id = "test_resource_1"
    user_id = "user1"
    
    # 락 획득
    result = await lock_manager.acquire_lock(resource_id, user_id)
    assert result == True
    
    # 같은 사용자가 동일 리소스 락 획득 시도
    result = await lock_manager.acquire_lock(resource_id, user_id)
    assert result == True  # 같은 사용자는 성공해야 함
    
    # 다른 사용자가 동일 리소스 락 획득 시도
    with pytest.raises(HTTPException) as exc_info:
        await lock_manager.acquire_lock(resource_id, "user2")
    assert exc_info.value.status_code == 423

@pytest.mark.asyncio
async def test_release_lock(lock_manager):
    """락 해제 테스트"""
    resource_id = "test_resource_2"
    user_id = "user1"
    
    # 락 획득
    await lock_manager.acquire_lock(resource_id, user_id)
    
    # 락 해제
    result = await lock_manager.release_lock(resource_id, user_id)
    assert result == True
    
    # 다른 사용자가 락 해제 시도
    result = await lock_manager.release_lock(resource_id, "user2")
    assert result == False

@pytest.mark.asyncio
async def test_lock_timeout(lock_manager):
    """락 타임아웃 테스트"""
    resource_id = "test_resource_3"
    user_id = "user1"
    
    # 락 설정 (짧은 타임아웃)
    lock_manager.lock_timeout = 1  # 1초
    await lock_manager.acquire_lock(resource_id, user_id)
    
    # 타임아웃 대기
    await asyncio.sleep(2)
    
    # 다른 사용자가 락 획득 시도
    result = await lock_manager.acquire_lock(resource_id, "user2")
    assert result == True

@pytest.mark.asyncio
async def test_concurrent_access(lock_manager):
    """동시 접근 테스트"""
    resource_id = "test_resource_4"
    
    async def try_lock(user_id: str):
        try:
            return await lock_manager.acquire_lock(resource_id, user_id)
        except HTTPException:
            return False
    
    # 여러 사용자가 동시에 락 획득 시도
    results = await asyncio.gather(
        try_lock("user1"),
        try_lock("user2"),
        try_lock("user3")
    )
    
    # 첫 번째 사용자만 성공해야 함
    assert results.count(True) == 1
    assert results[0] == True  # 첫 번째 요청 성공
    assert results[1] == False  # 나머지 실패
    assert results[2] == False

@pytest.mark.asyncio
async def test_get_lock_info(lock_manager):
    """락 정보 조회 테스트"""
    resource_id = "test_resource_5"
    user_id = "user1"
    
    # 락이 없을 때
    info = await lock_manager.get_lock_info(resource_id)
    assert info is None
    
    # 락 설정 후
    await lock_manager.acquire_lock(resource_id, user_id)
    info = await lock_manager.get_lock_info(resource_id)
    assert info is not None
    assert info["user_id"] == user_id