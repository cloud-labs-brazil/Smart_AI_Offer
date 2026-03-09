"""
Smart Offer — Database Connection

Async SQLAlchemy engine and session factory.

@see .claude/rules/03-architecture-stack.md
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from .config import settings

engine = create_async_engine(
    settings.database_url,
    echo=(settings.log_level == "debug"),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency — yields an async database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
