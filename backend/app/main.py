"""The Talent Bridge API: app setup, routers and error responses.

Run locally with `uv run uvicorn app.main:app --reload`.
"""

import fastapi
from fastapi import exception_handlers
from fastapi import exceptions
from fastapi import responses
from fastapi.middleware import cors

from app.core import config
from app.routers import auth
from app.routers import organizations
from app.routers import projects
from app.routers import skills
from app.routers import students

app = fastapi.FastAPI(title="Talent Bridge API")

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=config.settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(skills.router)
app.include_router(students.router)
app.include_router(organizations.router)
app.include_router(projects.router)


@app.exception_handler(fastapi.HTTPException)
async def http_exception_handler(
    request: fastapi.Request, exc: fastapi.HTTPException
) -> responses.JSONResponse:
    """Returns HTTP errors as `{"error": message}`."""
    del request  # Unused; required by the handler signature.
    return responses.JSONResponse(
        status_code=exc.status_code, content={"error": exc.detail}
    )


@app.exception_handler(exceptions.RequestValidationError)
async def validation_exception_handler(
    request: fastapi.Request, exc: exceptions.RequestValidationError
) -> responses.JSONResponse:
    """Returns the first validation error as `{"error": "field: message"}`."""
    errors = exc.errors()
    if not errors:
        return await exception_handlers.request_validation_exception_handler(
            request, exc
        )
    first = errors[0]
    field = ".".join(str(part) for part in first["loc"] if part != "body")
    message = f"{field}: {first['msg']}" if field else first["msg"]
    return responses.JSONResponse(status_code=422, content={"error": message})


@app.get("/health")
def health() -> dict[str, str]:
    """Reports that the API is up."""
    return {"status": "ok"}
