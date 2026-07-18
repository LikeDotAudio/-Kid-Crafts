import cv2
import numpy as np
import os
import shutil

def process_uploaded_image(img_path, output_dir):
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(os.path.join(output_dir, 'X'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'O'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'uncategorized'), exist_ok=True)

    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Orange threshold
    lower_orange = np.array([5, 100, 100])
    upper_orange = np.array([30, 255, 255])
    mask = cv2.inRange(hsv, lower_orange, upper_orange)
    
    # Clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    img_center_x = img.shape[1] / 2
    
    tile_count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 1000:
            continue
            
        x, y, w, h = cv2.boundingRect(cnt)
        roi = img[y:y+h, x:x+w]
        roi_mask = mask[y:y+h, x:x+w]
        
        # Create an image with an alpha channel
        roi_bgra = cv2.cvtColor(roi, cv2.COLOR_BGR2BGRA)
        # Set alpha to 0 where mask is 0
        roi_bgra[:, :, 3] = roi_mask
        
        # In the uploaded image, X's are on the left and O's are on the right
        # So we can just use the X coordinate to classify them
        center_x = x + w / 2
        if center_x < img_center_x:
            category = 'X'
        else:
            category = 'O'
                
        out_path = os.path.join(output_dir, category, f"new_token_{tile_count:04d}.png")
        cv2.imwrite(out_path, roi_bgra)
        tile_count += 1
        
    print(f"Extracted {tile_count} tokens.")

if __name__ == '__main__':
    img_path = "/home/anthony/.gemini/antigravity-cli/brain/528a82bd-7356-473d-8f09-a4651493fdd5/uploaded_media_1783105755121.png"
    process_uploaded_image(img_path, "parsed_tokens_orange")
