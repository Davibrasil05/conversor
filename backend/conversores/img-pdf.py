from PIL import Image
from fpdf import FPDF
import sys

def convert_image_to_pdf(image_path, output_pdf_path):
    image = Image.open(image_path)
    pdf = FPDF()
    pdf.add_page()
    pdf.image(image_path, x=0, y=0, w=210, h=297)  # Ajusta para tamanho A4
    pdf.output(output_pdf_path)

if __name__ == '__main__':
    for i in range(1, len(sys.argv), 2):
        input_image = sys.argv[i]  # Caminho da imagem
        output_pdf = sys.argv[i + 1]  # Caminho do PDF de saída
        convert_image_to_pdf(input_image, output_pdf)
