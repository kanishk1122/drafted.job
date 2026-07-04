import redis
import json
import functools
from typing import Optional, Any
from app.core.config import settings

class RedisCache:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        if settings.REDIS_URL:
            try:
                self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                self.client.ping()
                print("Redis Cache: Connection established.")
            except Exception as e:
                print(f"Redis Cache: Connection failed: {e}")
                self.client = None

    def get(self, key: str) -> Optional[Any]:
        if not self.client:
            return None
        data = self.client.get(key)
        return json.loads(data) if data else None

    def set(self, key: str, value: Any, expire_seconds: int = 3600):
        if not self.client:
            return
        
        def alchemy_encoder(obj):
            if hasattr(obj, "__dict__"):
                d = dict(obj.__dict__)
                d.pop("_sa_instance_state", None)
                # Convert dates/enums if necessary (json.dumps handles them if we are lucky or we need more logic)
                for k, v in d.items():
                    if hasattr(v, "isoformat"): d[k] = v.isoformat()
                    elif hasattr(v, "value"): d[k] = v.value # Enums
                return d
            return str(obj)

        try:
            serialized_val = json.dumps(value, default=alchemy_encoder)
            self.client.setex(key, expire_seconds, serialized_val)
        except Exception as e:
            print(f"Redis Cache: Serialization failed: {e}")

    def delete(self, key: str):
        if not self.client:
            return
        self.client.delete(key)

    def clear_pattern(self, pattern: str):
        if not self.client:
            return
        keys = self.client.keys(pattern)
        if keys:
            self.client.delete(*keys)

cache = RedisCache()

def cached(expire_seconds: int = 3600, key_prefix: str = "cache"):
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Create a unique key based on arguments
            arg_str = ":".join([str(arg) for arg in args[1:]]) # Skip 'self'
            kwarg_str = ":".join([f"{k}={v}" for k, v in sorted(kwargs.items())])
            key = f"{key_prefix}:{func.__name__}:{arg_str}:{kwarg_str}"
            
            # Try to get from cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # If not in cache, call function
            result = await func(*args, **kwargs)
            
            # Store in cache
            if result is not None:
                cache.set(key, result, expire_seconds)
            
            return result
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            arg_str = ":".join([str(arg) for arg in args[1:]])
            kwarg_str = ":".join([f"{k}={v}" for k, v in sorted(kwargs.items())])
            key = f"{key_prefix}:{func.__name__}:{arg_str}:{kwarg_str}"
            
            result = cache.get(key)
            if result is not None:
                return result
            
            result = func(*args, **kwargs)
            if result is not None:
                cache.set(key, result, expire_seconds)
            return result

        import asyncio
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator
