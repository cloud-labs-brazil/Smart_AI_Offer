import asyncio
from app.core.database import get_db
from sqlalchemy import text

async def check():
    async for db in get_db():
        # Count resolved vs unresolved owners
        r1 = await db.execute(text("SELECT COUNT(id) FROM offers WHERE owner LIKE '%[unresolved]%'"))
        unresolved = r1.scalar()
        r2 = await db.execute(text("SELECT COUNT(id) FROM offers WHERE owner NOT LIKE '%[unresolved]%'"))
        resolved = r2.scalar()
        print(f"Resolved owners: {resolved}")
        print(f"Unresolved owners: {unresolved}")

        # Show distinct unresolved logins
        r3 = await db.execute(text("SELECT DISTINCT owner FROM offers WHERE owner LIKE '%[unresolved]%' ORDER BY owner"))
        rows = r3.fetchall()
        print(f"\nRemaining unresolved owner logins ({len(rows)}):")
        for r in rows:
            print(f"  {r[0]}")
        break

asyncio.run(check())
