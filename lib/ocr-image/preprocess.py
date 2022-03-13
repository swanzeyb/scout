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

# Find bounding bpxes
def getBoundingBoxes(img):
  contours, _ = cv.findContours(img, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
  contours_poly = [None]*len(contours)
  boundRect = [None]*len(contours)
  for i, c in enumerate(contours):
    contours_poly[i] = cv.approxPolyDP(c, 3, True)
    boundRect[i] = cv.boundingRect(contours_poly[i])
  return boundRect


# Filter to large bounding boxes
sigWidth = 0.2
allBoxes = getBoundingBoxes(img)

sigBoxes = []
for box in allBoxes:
  if box[2] > width * sigWidth:
    sigBoxes.append(box)

# Get part of image
def crop(rect):
  x = rect[0]
  y = rect[1]
  w = rect[2]
  h = rect[3]
  return img[y:y+h, x:x+w]

# Find boxes with a mostly black background
def dominantColor(img):
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)     
        img = img.reshape((img.shape[0] * img.shape[1], 3))
        kmeans = KMeans(n_clusters = self.CLUSTERS)
        kmeans.fit(img)
        self.COLORçcluster_centers_
        self.LABELS = kmeans.labels_
        return self.COLORS.astype(int)

boxes = []
for rect in sigBoxes:
  box = crop(rect)
  dom = unique_count_app(box)
  if (dom != (255, 255, 255)):
    boxes.append(rect)

# Invert colors in boxes
def overlayImage(l_img, s_img, x_offset, y_offset):
  l_img[y_offset:y_offset+s_img.shape[0], x_offset:x_offset+s_img.shape[1]] = s_img

def invertBox(img, rect):
  x = rect[0]
  y = rect[1]
  box = crop(rect)
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
