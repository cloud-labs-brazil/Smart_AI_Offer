import asyncio
from app.core.database import get_db
from app.services.ingestion_service import IngestionService

async def reingest():
    csv_path = r'D:\VMs\Projetos\Smart_Offer\JIRA PBI (JIRA Indra) 2026-03-09T11_01_25-0300.csv'
    with open(csv_path, 'rb') as f:
        content = f.read()
    
    async for db in get_db():
        service = IngestionService()
        result = await service.ingest_csv(db, content)
        await db.commit()
        print('Ingestion successful:', result['ingested_count'], 'offers ingested')
        break

asyncio.run(reingest())
