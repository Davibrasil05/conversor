from PIL import Image
from fpdf import FPDF
import sys

def convert_image_to_pdf(image_path, output_pdf_path):
    image = Image.open(image_path)
    pdf = FPDF()
    pdf.add_page()
    pdf.image(image_path, x=0, y=0, w=210, h=297)  # Ajuste para o tamanho A4
    pdf.output(output_pdf_path)

if __name__ == '__main__':
    input_image = sys.argv[1]  # Caminho para a imagem
    output_pdf = sys.argv[2]  # Caminho para salvar o PDF
    convert_image_to_pdf(input_image, output_pdf)
