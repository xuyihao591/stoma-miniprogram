from PIL import Image, ImageDraw
import os

size = 81
grey = "#8A9BB0"
blue = "#4A90E2"

base = "C:/Users/xyh/WorkBuddy/20260501185436/stoma-miniprogram/images"
os.makedirs(base, exist_ok=True)

icons_data = [
    ("tab_home.png",       grey),
    ("tab_home_active.png", blue),
    ("tab_record.png",     grey),
    ("tab_record_active.png", blue),
    ("tab_user.png",       grey),
    ("tab_user_active.png",  blue),
]

for fname, color in icons_data:
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    c = size // 2

    if "home" in fname:
        pts = [(c, c-22), (c-22, c-6), (c-22, c+18), (c+22, c+18), (c+22, c-6)]
        draw.polygon(pts, fill=color)
        draw.rectangle((c-12, c-6, c+12, c+18), fill="white")
    elif "record" in fname:
        for y in [c-16, c, c+16]:
            draw.rounded_rectangle([c-24, y-6, c+24, y+6], radius=3, fill=color)
    elif "user" in fname:
        draw.ellipse([c-16, c-22, c+16, c+10], fill=color)
        draw.ellipse([c-28, c+4, c+28, c+28], fill=color)

    img.save(f"{base}/{fname}")
    print(f"Created: {fname}")

print("All 6 icons done!")
