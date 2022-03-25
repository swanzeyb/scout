import sys
import cv2 as cv
import numpy as np

# User Imports
import utils
import contours
import colors

# Resize result to
toWidth = int(sys.argv[1])
toHeight = int(sys.argv[2])

# Load image from Node
bytes = sys.stdin.buffer.read()
nparr = np.frombuffer(bytes, np.uint8)
src = cv.imdecode(nparr, 0)

# Remove alpha
# src = src[:,:,:3]

# Binary image
_, img = cv.threshold(src, 180, 255, cv.THRESH_BINARY)

# Find bounding boxes
rects = contours.findRects(img, 0.2)

for rect in rects:
  section = utils.crop(img, rect)
  primary = colors.primaryColor(section, cv.COLOR_GRAY2BGR)
  level = primary[0]

  if level < 180:
    if rect[2] < img.shape[0]:
      if rect[3] < img.shape[1]:
        white = np.full((rect[3], rect[2]), 255)
        img = utils.overlay(img, white, rect[0], rect[1])

# Invert black boxes
# for rect in rects:
#   section = utils.crop(img, rect)
#   primary = colors.primaryColor(section, cv.COLOR_GRAY2BGR)
#   level = primary[0]

#   if level < 180:
#     img = colors.invertSection(img, rect)

# Resize result
img = cv.resize(img, (toWidth, toHeight))

# Send image back to Node
imgBytes = cv.imencode('.png', img)[1].tobytes()
sys.stdout.buffer.write(imgBytes)
# cv.imwrite('hmm.png', img)
