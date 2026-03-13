import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from src.models.fir import FIRDataPayload

class FIRGenerator:
    def __init__(self, template_dir: str = None):
        if template_dir is None:
            # Default to the templates directory relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            template_dir = os.path.join(current_dir, 'templates')
        
        self.env = Environment(loader=FileSystemLoader(template_dir))
        self.template = self.env.get_template('fir_template.html')

    def generate_pdf(self, data: FIRDataPayload, output_path: str):
        """Generates FIR PDF from structured data payload."""
        render_data = data.model_dump()
        render_data['now'] = datetime.now()
        html_content = self.template.render(**render_data)
        
        # Rendering PDF
        HTML(string=html_content).write_pdf(output_path)
        return output_path
