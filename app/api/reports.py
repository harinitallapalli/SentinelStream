from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import random

from app.database.session import get_db
from app.models.report import SystemReport

router = APIRouter()

@router.get("/")
async def list_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemReport).order_by(SystemReport.id.desc()))
    reports = result.scalars().all()
    
    # If empty, pre-populate with some realistic mock reports as shown in Figma
    if len(reports) == 0:
        mocks = [
            SystemReport(
                name="Q2_Fraud_Analysis_v1.pdf",
                file_type="PDF",
                file_size="2.4 MB",
                status="COMPLETED",
                created_at=datetime.utcnow()
            ),
            SystemReport(
                name="AML_Compliance_Jan2026.pdf",
                file_type="PDF",
                file_size="4.1 MB",
                status="COMPLETED",
                created_at=datetime.utcnow()
            ),
            SystemReport(
                name="weekly_audit_system_global.csv",
                file_type="CSV",
                file_size="840 KB",
                status="COMPLETED",
                created_at=datetime.utcnow()
            )
        ]
        for m in mocks:
            db.add(m)
        await db.commit()
        
        result = await db.execute(select(SystemReport).order_by(SystemReport.id.desc()))
        reports = result.scalars().all()
        
    return reports

@router.post("/generate")
async def generate_report(db: AsyncSession = Depends(get_db)):
    report_names = [
        "Fraud_Risk_Assessment_{date}.pdf",
        "System_Anomaly_Log_{date}.csv",
        "AML_Verification_Audit_{date}.pdf",
        "Quarterly_Compliance_Review_{date}.pdf"
    ]
    
    date_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    name = random.choice(report_names).format(date=date_str)
    file_type = "PDF" if name.endswith(".pdf") else "CSV"
    size = f"{round(random.uniform(0.5, 5.0), 1)} MB" if file_type == "PDF" else f"{random.randint(100, 950)} KB"
    
    new_report = SystemReport(
        name=name,
        file_type=file_type,
        file_size=size,
        status="COMPLETED",
        created_at=datetime.utcnow()
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    return {"message": "Report generated successfully", "report": new_report}

@router.delete("/{report_id}")
async def delete_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemReport).filter(SystemReport.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.delete(report)
    await db.commit()
    return {"message": "Report record deleted successfully"}
