from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
import redis.asyncio as redis

from backend.data import router

from dotenv import load_dotenv
import os

load_dotenv()

redis_url = os.getenv("REDIS_URL")

redis_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_instance
    redis_instance = await redis.from_url(
        url=redis_url,
        encoding="utf-8", 
        decode_responses=True
    )
    
    yield
    
    if redis_instance:
        await redis_instance.close()
    redis_instance = None

app = FastAPI(title="Rate My Professors Chrome Extension API", version="2.0.0", lifespan=lifespan)

    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Server alive",
        "version": app.version,
    }
    
app.include_router(router)

# redis://default:kH5y5Iykzg3AJE03wzkRRnadvO6YzyjB@redis-17404.c281.us-east-1-2.ec2.redns.redis-cloud.com:17404