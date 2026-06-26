from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import random
import os
import csv
from fpdf import FPDF

from app.database.session import get_db
from app.models.report import SystemReport
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert
from app.utils.auth import get_current_user, require_analyst_or_admin, require_viewer_or_above
from app.models.user import User

router = APIRouter()

# Directory for storing generated report files
REPORT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


class PDFReport(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 15)
        # Title
        self.cell(0, 10, 'SentinelStream Fraud Intelligence Report', 0, 1, 'C')
        # Subtitle
        self.set_font('Helvetica', 'I', 10)
        self.cell(0, 10, f'Generated on: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}', 0, 1, 'C')
        self.line(10, 30, 200, 30)
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()} | Confidential - For Internal Use Only', 0, 0, 'C')


def generate_actual_pdf(filename: str, stats: dict, transactions: list, alerts: list):
    pdf = PDFReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font('Helvetica', '', 11)

    # Executive Summary Section
    pdf.set_font('Helvetica', 'B', 13)
    pdf.cell(0, 10, '1. Executive Summary', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    summary_text = (
        f"This report summarizes the transaction activity and threat metrics monitored by "
        f"SentinelStream. During the audit scope, a total of {stats['total_transactions']} transactions "
        f"were processed with a cumulative volume of INR {stats['total_amount']:,.2f}. The automated fraud "
        f"detection engine flagged {stats['fraud_transactions']} fraud cases and {stats['high_risk_transactions']} "
        f"high-risk cases, resulting in a system-wide fraud rate of {stats['fraud_rate']}%."
    )
    pdf.multi_cell(0, 6, summary_text)
    pdf.ln(5)

    # Key Metrics Table
    pdf.set_font('Helvetica', 'B', 13)
    pdf.cell(0, 10, '2. Performance Metrics', 0, 1, 'L')
    pdf.set_font('Helvetica', 'B', 11)
    
    # Table headers
    pdf.cell(90, 8, 'Metric description', 1, 0, 'L')
    pdf.cell(100, 8, 'Value', 1, 1, 'R')
    
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(90, 8, 'Total Transactions', 1, 0, 'L')
    pdf.cell(100, 8, str(stats['total_transactions']), 1, 1, 'R')
    
    pdf.cell(90, 8, 'Safe Transactions', 1, 0, 'L')
    pdf.cell(100, 8, str(stats['safe_transactions']), 1, 1, 'R')
    
    pdf.cell(90, 8, 'Fraudulent Transactions', 1, 0, 'L')
    pdf.cell(100, 8, str(stats['fraud_transactions']), 1, 1, 'R')
    
    pdf.cell(90, 8, 'High-Risk Transactions', 1, 0, 'L')
    pdf.cell(100, 8, str(stats['high_risk_transactions']), 1, 1, 'R')
    
    pdf.cell(90, 8, 'Total Financial Volume', 1, 0, 'L')
    pdf.cell(100, 8, f"INR {stats['total_amount']:,.2f}", 1, 1, 'R')
    
    pdf.cell(90, 8, 'Fraud Rate', 1, 0, 'L')
    pdf.cell(100, 8, f"{stats['fraud_rate']}%", 1, 1, 'R')
    pdf.ln(8)

    # Fraud Alerts Table
    pdf.set_font('Helvetica', 'B', 13)
    pdf.cell(0, 10, '3. Critical Alerts Log (Top 10)', 0, 1, 'L')
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(20, 8, 'Alert ID', 1, 0, 'C')
    pdf.cell(30, 8, 'Tx ID', 1, 0, 'C')
    pdf.cell(60, 8, 'Flag Reason', 1, 0, 'L')
    pdf.cell(40, 8, 'Priority', 1, 0, 'C')
    pdf.cell(40, 8, 'Status', 1, 1, 'C')

    pdf.set_font('Helvetica', '', 9)
    for alert in alerts[:10]:
        pdf.cell(20, 7, str(alert.id), 1, 0, 'C')
        pdf.cell(30, 7, str(alert.transaction_id), 1, 0, 'C')
        pdf.cell(60, 7, str(alert.reason), 1, 0, 'L')
        pdf.cell(40, 7, str(alert.priority), 1, 0, 'C')
        status_label = "Resolved" if alert.resolved else "Open"
        pdf.cell(40, 7, status_label, 1, 1, 'C')

    # Save PDF
    pdf.output(os.path.join(REPORT_DIR, filename), 'F')


def generate_actual_csv(filename: str, transactions: list):
    filepath = os.path.join(REPORT_DIR, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Transaction ID', 'User ID', 'Amount (INR)', 'Location', 'Status', 'Timestamp'])
        for t in transactions:
            writer.writerow([
                t.id,
                t.user_id,
                t.amount,
                t.location,
                t.status,
                t.timestamp.strftime("%Y-%m-%d %H:%M:%S") if t.timestamp else ''
            ])


@router.get("/")
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_viewer_or_above())
):
    result = await db.execute(select(SystemReport).order_by(SystemReport.id.desc()))
    reports = result.scalars().all()
    
    # Pre-populate with realistic starting files if empty
    if len(reports) == 0:
        mocks = [
            SystemReport(
                name="Q2_Fraud_Analysis_v1.pdf",
                file_type="PDF",
                file_size="24 KB",
                status="COMPLETED",
                created_at=datetime.utcnow()
            ),
            SystemReport(
                name="AML_Compliance_Jan2026.pdf",
                file_type="PDF",
                file_size="32 KB",
                status="COMPLETED",
                created_at=datetime.utcnow()
            ),
            SystemReport(
                name="weekly_audit_system_global.csv",
                file_type="CSV",
                file_size="8 KB",
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
async def generate_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin())
):
    # Fetch live statistics
    tx_result = await db.execute(select(Transaction))
    transactions = tx_result.scalars().all()
    
    alert_result = await db.execute(select(FraudAlert).order_by(FraudAlert.id.desc()))
    alerts = alert_result.scalars().all()

    total_transactions = len(transactions)
    fraud_transactions = sum(1 for t in transactions if t.status == "FRAUD")
    high_risk_transactions = sum(1 for t in transactions if t.status == "HIGH_RISK")
    safe_transactions = sum(1 for t in transactions if t.status == "SAFE")
    total_amount = sum(t.amount for t in transactions)
    
    fraud_rate = 0.0
    if total_transactions > 0:
        fraud_rate = round(((fraud_transactions + high_risk_transactions) / total_transactions) * 100, 2)

    stats = {
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions,
        "high_risk_transactions": high_risk_transactions,
        "safe_transactions": safe_transactions,
        "total_amount": total_amount,
        "fraud_rate": fraud_rate
    }

    report_templates = [
        ("Fraud_Risk_Assessment_{date}.pdf", "PDF"),
        ("System_Anomaly_Log_{date}.csv", "CSV"),
        ("AML_Verification_Audit_{date}.pdf", "PDF"),
        ("Quarterly_Compliance_Review_{date}.pdf", "PDF")
    ]
    
    template, file_type = random.choice(report_templates)
    date_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    name = template.format(date=date_str)
    
    # Generate actual physical files
    if file_type == "PDF":
        generate_actual_pdf(name, stats, transactions, alerts)
    else:
        generate_actual_csv(name, transactions)
        
    # Get actual file size
    filepath = os.path.join(REPORT_DIR, name)
    filesize_kb = round(os.path.getsize(filepath) / 1024, 1)
    size_str = f"{filesize_kb} KB"

    new_report = SystemReport(
        name=name,
        file_type=file_type,
        file_size=size_str,
        status="COMPLETED",
        created_at=datetime.utcnow()
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    return {"message": "Report generated successfully", "report": new_report}


@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_viewer_or_above())
):
    result = await db.execute(select(SystemReport).filter(SystemReport.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    filepath = os.path.join(REPORT_DIR, report.name)
    
    # Dynamic fallback check: If physical file is missing (e.g. for pre-seeded/mock reports), generate it on-the-fly!
    if not os.path.exists(filepath):
        # Gather live data for on-the-fly generation
        tx_result = await db.execute(select(Transaction))
        transactions = tx_result.scalars().all()
        
        alert_result = await db.execute(select(FraudAlert).order_by(FraudAlert.id.desc()))
        alerts = alert_result.scalars().all()

        total_transactions = len(transactions)
        fraud_transactions = sum(1 for t in transactions if t.status == "FRAUD")
        high_risk_transactions = sum(1 for t in transactions if t.status == "HIGH_RISK")
        safe_transactions = sum(1 for t in transactions if t.status == "SAFE")
        total_amount = sum(t.amount for t in transactions)
        
        fraud_rate = 0.0
        if total_transactions > 0:
            fraud_rate = round(((fraud_transactions + high_risk_transactions) / total_transactions) * 100, 2)

        stats = {
            "total_transactions": total_transactions,
            "fraud_transactions": fraud_transactions,
            "high_risk_transactions": high_risk_transactions,
            "safe_transactions": safe_transactions,
            "total_amount": total_amount,
            "fraud_rate": fraud_rate
        }

        if report.file_type == "PDF":
            generate_actual_pdf(report.name, stats, transactions, alerts)
        else:
            generate_actual_csv(report.name, transactions)

    media_type = "application/pdf" if report.file_type == "PDF" else "text/csv"
    return FileResponse(
        path=filepath,
        media_type=media_type,
        filename=report.name
    )


@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin())
):
    result = await db.execute(select(SystemReport).filter(SystemReport.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    filepath = os.path.join(REPORT_DIR, report.name)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Error deleting physical file: {e}")
    
    await db.delete(report)
    await db.commit()
    return {"message": "Report record deleted successfully"}

