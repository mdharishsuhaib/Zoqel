from PIL import Image, ImageOps
import sys

# Load original logo
img = Image.open('public/logo.png').convert("RGBA")
width, height = img.size

# Find the bounding box of non-transparent pixels to crop out empty space
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
    width, height = img.size

# We want a square for the favicon. Let's assume the icon mark is on the left.
# So we crop a square from the left edge.
side = min(width, height)
# crop left square
square_img = img.crop((0, 0, side, side))

# Save multi-size ICO
square_img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

# Save Apple Touch Icon (180x180)
apple_touch = square_img.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save('public/apple-touch-icon.png', format='PNG')

# Save Android Manifest Icons
android_192 = square_img.resize((192, 192), Image.Resampling.LANCZOS)
android_192.save('public/android-chrome-192x192.png', format='PNG')

android_512 = square_img.resize((512, 512), Image.Resampling.LANCZOS)
android_512.save('public/android-chrome-512x512.png', format='PNG')

print("Favicons generated successfully!")
