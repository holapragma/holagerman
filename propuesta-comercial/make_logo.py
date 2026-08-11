from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 400
SCALE = 4
S = SIZE * SCALE

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

green = (15, 81, 50, 255)  # #0F5132
radius = int(S * 0.24)
draw.rounded_rectangle([0, 0, S, S], radius=radius, fill=green)

font_paths = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/SFNSDisplay.ttf",
]
font = None
for fp in font_paths:
    if os.path.exists(fp):
        try:
            font = ImageFont.truetype(fp, int(S * 0.56))
            break
        except Exception:
            continue
if font is None:
    font = ImageFont.load_default()

text = "G"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(((S - tw) / 2 - bbox[0], (S - th) / 2 - bbox[1]), text, font=font, fill=(255, 255, 255, 255))

img = img.resize((SIZE, SIZE), Image.LANCZOS)
img.save("assets/logo.png")
print("logo saved")
