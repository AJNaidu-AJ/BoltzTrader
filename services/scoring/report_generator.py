from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import pandas as pd
import os
from datetime import datetime

def generate_pdf_report(symbol: str, backtest_data: dict, metrics: dict) -> str:
    """Generate PDF backtest report"""
    filename = f"backtest_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join("/tmp", filename)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph(f"Backtest Report: {symbol}", title_style))
    story.append(Spacer(1, 20))
    
    # Summary metrics table
    story.append(Paragraph("Performance Summary", styles['Heading2']))
    
    metrics_data = [
        ['Metric', 'Value'],
        ['Total Return', f"{metrics['total_return']}%"],
        ['Accuracy', f"{metrics['accuracy']}%"],
        ['Sharpe Ratio', f"{metrics['sharpe_ratio']}"],
        ['Max Drawdown', f"{metrics['max_drawdown']}%"],
        ['Total Trades', f"{metrics['total_trades']}"],
        ['Win Rate', f"{metrics['win_rate']}%"]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[2*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(metrics_table)
    story.append(Spacer(1, 20))
    
    # Backtest details
    story.append(Paragraph("Backtest Details", styles['Heading2']))
    details = [
        f"Symbol: {symbol}",
        f"Period: {backtest_data['period_days']} days",
        f"Start Date: {backtest_data['dates'][0][:10]}",
        f"End Date: {backtest_data['dates'][-1][:10]}",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    ]
    
    for detail in details:
        story.append(Paragraph(detail, styles['Normal']))
    
    doc.build(story)
    return filepath

def generate_csv_report(symbol: str, backtest_data: dict, metrics: dict) -> str:
    """Generate CSV backtest report"""
    filename = f"backtest_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = os.path.join("/tmp", filename)
    
    # Create DataFrame with backtest data
    df = pd.DataFrame({
        'Date': backtest_data['dates'],
        'Price': backtest_data['prices'],
        'Signal': backtest_data['signals'],
        'Portfolio_Value': backtest_data['portfolio_values']
    })
    
    # Add metrics as header comments
    with open(filepath, 'w') as f:
        f.write(f"# Backtest Report for {symbol}\n")
        f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Total Return: {metrics['total_return']}%\n")
        f.write(f"# Accuracy: {metrics['accuracy']}%\n")
        f.write(f"# Sharpe Ratio: {metrics['sharpe_ratio']}\n")
        f.write(f"# Max Drawdown: {metrics['max_drawdown']}%\n")
        f.write(f"# Win Rate: {metrics['win_rate']}%\n")
        f.write("#\n")
    
    # Append DataFrame
    df.to_csv(filepath, mode='a', index=False)
    
    return filepath