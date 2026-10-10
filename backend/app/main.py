import logging
from contextlib import asynccontextmanager
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_v1_router
from app.config import settings
from app.database import Base, engine
from app.exceptions import DomainValidationError, EntityNotFoundError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("task_manager_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize DB tables."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="REST API for Mini Task Management Application (Boards & Tasks).",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# R18: CORS configuration for frontend development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized JSON error response format helper
def format_error_response(code: str, message: str) -> Dict[str, Any]:
    return {
        "data": None,
        "error": {
            "code": code,
            "message": message,
        },
    }


# Centralized exception handlers for consistent JSON error shape
@app.exception_handler(EntityNotFoundError)
async def entity_not_found_handler(request: Request, exc: EntityNotFoundError):
    """Handle 404 entity not found domain exceptions."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=format_error_response(
            code=exc.error_code,
            message=exc.message,
        ),
    )


@app.exception_handler(DomainValidationError)
async def domain_validation_handler(request: Request, exc: DomainValidationError):
    """Handle 400 domain validation exceptions."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=format_error_response(
            code=exc.error_code,
            message=exc.message,
        ),
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    """Handle 422 FastAPI / Pydantic schema validation errors."""
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Validation error")

    # Clean up pydantic ValueError prefix if present
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content=format_error_response(
            code="VALIDATION_FAILED",
            message=msg,
        ),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle standard HTTP exceptions with uniform error shape."""
    error_type = "BAD_REQUEST"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        error_type = "NOT_FOUND"
    elif exc.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT):
        error_type = "VALIDATION_FAILED"

    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=error_type,
            message=str(exc.detail),
        ),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Handle unexpected 500 errors gracefully with uniform error shape."""
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred.",
        ),
    )


# Health check endpoint
@app.get("/health", tags=["Health"], summary="API Health Check")
def health_check():
    """Health check endpoint to verify backend service readiness."""
    return {
        "data": {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        },
        "error": None,
    }


# Mount API v1 routes
app.include_router(api_v1_router)
