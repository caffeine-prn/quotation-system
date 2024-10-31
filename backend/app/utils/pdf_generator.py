from typing import Optional
import os
from tempfile import NamedTemporaryFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from decimal import Decimal

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """사용자 정의 스타일 설정"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=30
        ))
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12
        ))

    def _create_header_section(self, data: dict) -> list:
        """헤더 섹션 생성"""
        elements = []
        
        # 제목
        elements.append(Paragraph("Quotation", self.styles['CustomTitle']))
        elements.append(Spacer(1, 12))
        
        # 견적서 정보 테이블
        info_data = [
            [f"QUOTE #: {data['quote_number']}", ""],
            [f"DATE: {data['date']}", f"Customer: {data['customer_name']}"],
            [f"VALID UNTIL: {data['valid_until']}", f"Project Description: {data['project_description']}"]
        ]
        
        info_table = Table(info_data, colWidths=[3*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _create_items_section(self, items: list) -> list:
        """항목 섹션 생성"""
        elements = []
        
        # 테이블 헤더
        headers = ["No.", "Item", "Q'ty", "Unit Price", "Amount", "Remark"]
        table_data = [headers]
        
        # 항목 데이터
        for idx, item in enumerate(items, 1):
            row = [
                str(idx),
                item['name'],
                str(item['quantity']),
                f"{item['unit_price']:,}",
                f"{item['quantity'] * item['unit_price']:,}",
                item.get('remark', '')
            ]
            table_data.append(row)
        
        # 테이블 생성
        colWidths = [0.5*inch, 3*inch, 0.8*inch, 1.2*inch, 1.2*inch, 1.8*inch]
        table = Table(table_data, colWidths=colWidths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('TOPPADDING', (0,0), (-1,0), 12),
            ('ALIGN', (0,1), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('ALIGN', (2,1), (4,-1), 'RIGHT'),
        ]))
        elements.append(table)
        
        return elements

    def _create_footer_section(self, total_amount: Decimal) -> list:
        """푸터 섹션 생성"""
        elements = []
        elements.append(Spacer(1, 20))
        
        # 합계
        total_data = [["", "", "", "Total", f"{total_amount:,}"]]
        total_table = Table(total_data, colWidths=[0.5*inch, 3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (-2,-1), (-1,-1), 'RIGHT'),
            ('FONTNAME', (-2,-1), (-1,-1), 'Helvetica-Bold'),
            ('LINEABOVE', (-2,-1), (-1,-1), 1, colors.black),
            ('LINEBELOW', (-2,-1), (-1,-1), 1, colors.black),
        ]))
        elements.append(total_table)
        
        # 참고사항
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Note:", self.styles['CustomHeader']))
        elements.append(Paragraph("1. Currency: KRW", self.styles['Normal']))
        elements.append(Paragraph("2. VAT excluded", self.styles['Normal']))
        
        return elements

    def generate_quotation(self, quotation_data: dict) -> str:
        """견적서 PDF 생성"""
        # 임시 파일 생성
        temp_file = NamedTemporaryFile(delete=False, suffix='.pdf')
        doc = SimpleDocTemplate(
            temp_file.name,
            pagesize=A4,
            rightMargin=1.25*cm,
            leftMargin=1.25*cm,
            topMargin=1.25*cm,
            bottomMargin=1.25*cm
        )
        
        # 문서 요소 생성
        elements = []
        elements.extend(self._create_header_section(quotation_data))
        elements.extend(self._create_items_section(quotation_data['items']))
        elements.extend(self._create_footer_section(quotation_data['total_amount']))
        
        # PDF 생성
        doc.build(elements)
        
        return temp_file.name