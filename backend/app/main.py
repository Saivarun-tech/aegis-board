from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    router,
    work_router,
    collaboration_router,
)
from app.employee_routes import router as employee_router
from app.collaboration_ws import router as collaboration_ws_router


app = FastAPI(
    title="Aegis Board API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aegis-board-mauve.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(work_router)
app.include_router(employee_router)
app.include_router(collaboration_router)
app.include_router(
    collaboration_ws_router
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "aegis-board-api",
    }