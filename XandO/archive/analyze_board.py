import cv2
import numpy as np

img = cv2.imread('new_playing_card.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)

lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=200, maxLineGap=20)
h_lines = []
v_lines = []

if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if abs(y2 - y1) < 20: # horizontal
            h_lines.append(min(y1, y2))
        elif abs(x2 - x1) < 20: # vertical
            v_lines.append(min(x1, x2))

# Group lines
h_groups = []
h_lines.sort()
for y in h_lines:
    if not h_groups or y - h_groups[-1][-1] > 30:
        h_groups.append([y])
    else:
        h_groups[-1].append(y)

v_groups = []
v_lines.sort()
for x in v_lines:
    if not v_groups or x - v_groups[-1][-1] > 30:
        v_groups.append([x])
    else:
        v_groups[-1].append(x)

h_coords = [np.mean(g) for g in h_groups]
v_coords = [np.mean(g) for g in v_groups]

print(f"Image shape: {img.shape}")
print(f"Horizontal lines roughly at: {h_coords}")
print(f"Vertical lines roughly at: {v_coords}")
