"""
Main FastAPI application.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.exceptions import AppException
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "action": "error",
            "message": exc.message,
            "data": None,
            "errors": [{"message": exc.message}],
            "meta": {
                "timestamp": None,
                "version": settings.VERSION
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors from Pydantic."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"][1:])
        errors.append({
            "field": field,
            "message": error["msg"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "action": "validation_error",
            "message": "Validation failed",
            "data": None,
            "errors": errors,
            "meta": {
                "timestamp": None,
                "version": settings.VERSION
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "action": "internal_error",
            "message": "Internal server error" if settings.ENVIRONMENT == "production" else str(exc),
            "data": None,
            "errors": [{"message": "An unexpected error occurred"}],
            "meta": {
                "timestamp": None,
                "version": settings.VERSION
            }
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": settings.API_V1_PREFIX
    }


# Import and include routers
from app.api.v1 import auth, campus, users, students, academic, attendance

app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(campus.router, prefix=f"{settings.API_V1_PREFIX}/campuses", tags=["Campuses"])
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}")
app.include_router(students.router, prefix=f"{settings.API_V1_PREFIX}")
app.include_router(academic.router, prefix=f"{settings.API_V1_PREFIX}/academic", tags=["Academic"])
app.include_router(attendance.router, prefix=f"{settings.API_V1_PREFIX}/attendance", tags=["Attendance"])
