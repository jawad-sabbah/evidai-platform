from fastapi import APIRouter

from app.api.routes.cases import router as cases_router

api_router = APIRouter()

api_router.include_router(cases_router)
