from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.case_members import router as case_members_router
from app.api.routes.cases import router as cases_router

api_router = APIRouter()

api_router.include_router(cases_router)
api_router.include_router(case_members_router)
api_router.include_router(auth_router)
