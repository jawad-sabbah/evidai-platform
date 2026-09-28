from fastapi import FastAPI

from app.api.routes import api_router
from app.api.exception_handlers import register_exception_handlers

app = FastAPI(
    title="EvidAI API",
    version="0.1.0",
)


register_exception_handlers(app)
app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
