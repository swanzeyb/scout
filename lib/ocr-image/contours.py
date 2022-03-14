import cv2 as cv
import numpy as np

def rectsInImg(img):
  contours, _ = cv.findContours(img, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
  contours_poly = [None]*len(contours)
  boundRect = [None]*len(contours)
  for i, c in enumerate(contours):
    contours_poly[i] = cv.approxPolyDP(c, 3, True)
    boundRect[i] = cv.boundingRect(contours_poly[i])
  return boundRect

def findRects(src, sig=0.0):
  # Get inverse to find additional rects
  resultsOne = rectsInImg(src)
  inv = cv.bitwise_not(src)
  resultsTwo = rectsInImg(inv)
  allBoxes = np.unique(np.concatenate((resultsOne, resultsTwo)), axis=0)

  width = src.shape[1]
  sigBoxes = []
  for box in allBoxes:
    if box[2] > width * sig:
      sigBoxes.append(box)

  return sigBoxes
