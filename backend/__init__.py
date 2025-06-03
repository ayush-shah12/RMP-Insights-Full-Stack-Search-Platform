from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.data import router

app = FastAPI(title="Rate My Professors Chrome Extension API", version="2.0.0")

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

