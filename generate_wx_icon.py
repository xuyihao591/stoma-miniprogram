from PIL import Image, ImageDraw
import os

# 生成微信图标 40x40px (rpx)
size = 40
green = "#07C160"
base = "C:/Users/xyh/WorkBuddy/20260501185436/stoma-miniprogram/images"
os.makedirs(base, exist_ok=True)

img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# 画微信图标 - 绿色圆形背景 + 白色字母
draw.ellipse([0, 0, size-1, size-1], fill=green)
# 画"W"字母形状简化版
c = size // 2
draw.polygon([(c-10, 12), (c-5, 28), (c, 18), (c+5, 28), (c+10, 12)], fill="white")
draw.rectangle([c-3, 18, c+3, 30], fill="white")

img.save(f"{base}/wx_icon.png")
print("Created wx_icon.png")
