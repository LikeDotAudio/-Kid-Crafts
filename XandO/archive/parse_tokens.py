import cv2
import numpy as np
import os
import glob
import shutil

def process_images(input_dir, output_dir):
    # Clear output directory if it exists for a fresh run
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
        
    categories = ['X', 'O', 'card', 'uncategorized']
    for cat in categories:
        os.makedirs(os.path.join(output_dir, cat), exist_ok=True)
        
    image_files = glob.glob(os.path.join(input_dir, '*.jpg'))
    
    tile_count = 0
    
    for img_path in image_files:
        print(f"Processing {img_path}...")
        img = cv2.imread(img_path)
        if img is None:
            print(f"Failed to read {img_path}")
            continue
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur slightly to remove noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Adaptive thresholding to find the black borders, inverted so borders are white
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        
        # Morphological operations to close gaps in borders
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Filter out noise (very small) and full-page borders (very large)
            if area < 50000 or area > img.shape[0]*img.shape[1] * 0.8:
                continue
                
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Crop the tile
            roi = img[y:y+h, x:x+w]
            
            category = 'uncategorized'
            
            if area > 500000:
                category = 'card'
            else:
                # Differentiate X and O by looking at ink density
                roi_gray = gray[y:y+h, x:x+w]
                
                # Strip 15% of the border so we don't count the bounding box lines
                ih, iw = int(h*0.15), int(w*0.15)
                inner = roi_gray[ih:h-ih, iw:w-iw]
                
                if inner.size > 0:
                    # Otsu thresholding to find ink (ink becomes white/255)
                    _, inner_thresh = cv2.threshold(inner, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
                    
                    total_ink = np.sum(inner_thresh > 0) / inner_thresh.size
                    
                    # Look at the center 30% of the inner region
                    ch, cw = inner_thresh.shape
                    cy, cx = ch//2, cw//2
                    dh, dw = int(ch*0.15), int(cw*0.15)
                    center = inner_thresh[max(0, cy-dh):min(ch, cy+dh), max(0, cx-dw):min(cw, cx+dw)]
                    
                    if center.size > 0:
                        center_ink = np.sum(center > 0) / center.size
                        
                        if total_ink < 0.01:
                            category = 'uncategorized' # Blank square
                        elif center_ink > 0.05:
                            category = 'X'
                        else:
                            category = 'O'
            
            out_path = os.path.join(output_dir, category, f"tile_{tile_count:04d}.png")
            cv2.imwrite(out_path, roi)
            tile_count += 1
            
    print(f"Done! Extracted {tile_count} tiles.")

if __name__ == '__main__':
    process_images('RAW token', 'parsed_tokens')
