import redis
import json
from config import Config  # Assuming credentials are stored in config.py

# Connect to Redis Cloud
redis_client = redis.Redis(
    host=Config.REDIS_HOST,
    port=Config.REDIS_PORT,
    decode_responses=True,
    username=Config.REDIS_USERNAME,
    password=Config.REDIS_PASSWORD,
)

# Fetch all keys
keys = redis_client.keys("*")
print("Stored Keys:", keys)

# Fetch specific session data
if keys:
    session_data = redis_client.get(keys[0])  # Get first key's value
    print("Session Data:", json.loads(session_data))
