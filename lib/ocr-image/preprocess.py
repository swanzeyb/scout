import sys
import cv2 as cv
import numpy as np

# Resize result to
toWidth = int(sys.argv[1])
toHeight = int(sys.argv[2])

# Load image from Node
bytes = sys.stdin.buffer.read()
nparr = np.frombuffer(bytes, np.uint8)
src = cv.imdecode(nparr, cv.IMREAD_GRAYSCALE)

# Image dimensions
width = src.shape[1]
height = src.shape[0]

# Binary image
ret, img = cv.threshold(src, 180, 255, cv.THRESH_BINARY)

# Find boxes
def getSigBoxes(img, sigWidth):
  contours, _ = cv.findContours(img, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
  contours_poly = [None]*len(contours)
  boundRect = [None]*len(contours)
  for i, c in enumerate(contours):
    contours_poly[i] = cv.approxPolyDP(c, 3, True)
    boundRect[i] = cv.boundingRect(contours_poly[i])
  boxes = []
  for box in boundRect:
    if box[2] >= sigWidth:
      if box[2] != width:
        boxes.append(box)
  return boxes

boxes = getSigBoxes(img, width * 0.2)

# Invert colors in boxes
def overlayImage(l_img, s_img, x_offset, y_offset):
  l_img[y_offset:y_offset+s_img.shape[0], x_offset:x_offset+s_img.shape[1]] = s_img

def invertBox(img, rect):
  x = rect[0]
  y = rect[1]
  w = rect[2]
  h = rect[3]
  box = img[y:y+h, x:x+w]
  box = cv.bitwise_not(box)
  overlayImage(img, box, x, y)

for box in boxes:
  invertBox(img, box)

# Resize result
img = cv.resize(img, (toWidth, toHeight))

# Send image back to Node
imgBytes = cv.imencode('.png', img)[1].tobytes()
sys.stdout.buffer.write(imgBytes)
# cv.imwrite('hmm.png', img)
