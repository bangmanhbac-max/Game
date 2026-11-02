from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.init_db import init_db
from .api.v1 import upload, generate, decks, auth, games, documents, chat, community, contact, admin_db

# Tự động khởi tạo Database và seed dữ liệu ban đầu
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API cho hệ thống học tập trò chơi hóa bằng AI (Auth, Database, VLM Engine, 3D Granny Escape, Web Admin)",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}", tags=["Authentication"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}", tags=["Upload & Parse"])
app.include_router(generate.router, prefix=f"{settings.API_V1_STR}", tags=["AI Content Generator"])
app.include_router(decks.router, prefix=f"{settings.API_V1_STR}", tags=["Learning Decks"])
app.include_router(games.router, prefix=f"{settings.API_V1_STR}", tags=["Games & Leaderboard"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}", tags=["Documents Management"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}", tags=["AI Copilot & World Chat"])
app.include_router(community.router, prefix=f"{settings.API_V1_STR}", tags=["Community & Friends"])
app.include_router(contact.router, prefix=f"{settings.API_V1_STR}", tags=["Contact & Support"])
app.include_router(admin_db.router, prefix=f"{settings.API_V1_STR}", tags=["Web Database Admin"])


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "auth": "JWT enabled",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
