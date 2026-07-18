import cv2
import numpy as np
import glob
import os

files = glob.glob('new_token_*.png')
for file in files:
    img = cv2.imread(file, cv2.IMREAD_UNCHANGED)
    if img is not None:
        # The image currently has alpha = 0 where ink was, because ink is not orange.
        # Let's fix this by finding the dark ink and making it opaque.
        # Actually, since the original image had a black background, maybe we should just make the truly black pixels transparent.
        # But wait! I only have the already processed transparent PNGs here.
        # Can I recover the ink? No, because in extract_orange_tokens.py, I only saved `roi_bgra` which was just the ROI with alpha modified.
        # The color info is still there! cv2.cvtColor(roi, cv2.COLOR_BGR2BGRA) keeps the RGB values!
        # Let's make the alpha channel opaque (255) for dark pixels.
        
        b, g, r, a = cv2.split(img)
        gray = cv2.cvtColor(cv2.merge([b,g,r]), cv2.COLOR_BGR2GRAY)
        
        # Ink is dark
        _, dark_mask = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)
        
        # We want alpha to be 255 where it is currently 255 (the orange part)
        # PLUS where it is dark (the ink) BUT only inside the token!
        # Since the token might be surrounded by black background... wait, the background is also dark!
        # So we can't easily distinguish ink from black background using just darkness.
        
        # Let's use morphological closing on the existing alpha channel to fill the holes (which is the ink).
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        new_alpha = cv2.morphologyEx(a, cv2.MORPH_CLOSE, kernel)
        
        # Save it
        res = cv2.merge([b, g, r, new_alpha])
        # Wait, if we use cv2 to save, it's 100% standard PNG, but to be safe we can use PIL
        cv2.imwrite(file, res)

from PIL import Image
for file in files:
    # Just open and save with PIL to guarantee standard PNG encoding
    with Image.open(file) as im:
        im.save(file, "PNG")

print("Fixed images!")
