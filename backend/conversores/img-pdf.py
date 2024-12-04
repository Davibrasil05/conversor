from PIL import Image
from fpdf import FPDF
import sys

def convert_images_to_pdf(image_paths, output_pdf_path):
    pdf = FPDF(unit='mm', format='A4')
    for image_path in image_paths:
        image = Image.open(image_path)
        image_width, image_height = image.size
        aspect_ratio = image_height / image_width
        pdf_width = 210
        pdf_height = pdf_width * aspect_ratio

        if pdf_height > 297:
            pdf_height = 297
            pdf_width = pdf_height / aspect_ratio

        pdf.add_page()
        pdf.image(image_path, x=0, y=0, w=pdf_width, h=pdf_height)

    pdf.output(output_pdf_path)
    print(f"PDF salvo em: {output_pdf_path}")

if __name__ == "__main__":
    image_files = sys.argv[1:-1]  # Lista de imagens recebidas como argumento
    output_pdf = sys.argv[-1]    # Caminho do PDF final
    convert_images_to_pdf(image_files, output_pdf)
