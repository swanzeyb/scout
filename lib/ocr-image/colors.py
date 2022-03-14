import cv2 as cv
import numpy as np

# User imports
import utils

def invertSection(src, rect):
  section = utils.crop(src, rect)
  section = cv.bitwise_not(section)
  result = utils.overlay(src, section, rect[0], rect[1])
  return result

def primaryColor(src, convertFlag):
  data = cv.cvtColor(src, convertFlag)
  data = np.reshape(data, (-1,3))
  data = np.float32(data)
  criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
  flags = cv.KMEANS_RANDOM_CENTERS
  compactness,labels,centers = cv.kmeans(data, 1, None, criteria, 10, flags)
  bgr = centers[0].astype(np.int32)
  return bgr
