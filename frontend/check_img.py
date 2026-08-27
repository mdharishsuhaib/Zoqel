from PIL import Image

try:
    img = Image.open('public/logo.png')
    print(f"Dimensions: {img.size}")
except Exception as e:
    print(f"Error: {e}")
