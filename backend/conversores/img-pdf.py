from PIL import Image

image_path= 'conversor/assets/image.png'
image = Image.open(image_path)


image = image.convert('RGB')

pdf_path = 'output.pdf'
image.save(pdf_path,"PDF")

print(f"Imagem convertida para PDF com sucesso! PDF salvo em: {pdf_path}")