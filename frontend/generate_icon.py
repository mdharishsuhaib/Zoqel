from PIL import Image

img = Image.open('public/logo.png').convert("RGBA")
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

width, height = img.size
side = min(width, height)
square_img = img.crop((0, 0, side, side))

# Save square icon for collapsed sidebar
square_img.save('public/icon.png', format='PNG')
print("icon.png generated")
