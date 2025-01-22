from PIL import Image
import sys
import os

def comprimeimage(imagen, imagem_comprimida):
    try:
        # Abre a imagem original
        imagem_original = Image.open(imagen)

        # Define o novo tamanho da imagem
        novo_tamanho = (800, 600)
        imagem_redimensionada = imagem_original.resize(novo_tamanho, Image.Resampling.LANCZOS)

        # Garante que o diretório de saída existe
        os.makedirs(os.path.dirname(imagem_comprimida), exist_ok=True)

        # Salva a imagem redimensionada e comprimida
        imagem_redimensionada.save(imagem_comprimida, optimize=True, quality=70)
        print(f"Imagem comprimida salva em: {imagem_comprimida}")

    except Exception as e:
        print(f"Erro ao comprimir a imagem: {e}")

if __name__ == "__main__":
    # Verifica se os argumentos foram fornecidos
    if len(sys.argv) < 3:
        print("Uso: python compressorImage.py <caminho_imagem> <caminho_saida>")
        sys.exit(1)

    imagem = sys.argv[1]
    imagem_comprimida = sys.argv[2]

    # Verifica se o caminho da imagem de entrada é válido
    if not os.path.exists(imagem):
        print(f"Erro: O arquivo de entrada '{imagem}' não existe.")
        sys.exit(1)

    comprimeimage(imagem, imagem_comprimida)
