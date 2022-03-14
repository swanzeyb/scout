import cv2 as cv
import numpy as np

def crop(src, rect):
  x = rect[0]
  y = rect[1]
  w = rect[2]
  h = rect[3]
  return src[y:y+h, x:x+w]

def show(img):
  cv.imshow('Preview', img)
  cv.waitKey(0)

def overlay(l_img, s_img, x_offset, y_offset):
  result = np.copy(l_img)
  result[y_offset:y_offset+s_img.shape[0], x_offset:x_offset+s_img.shape[1]] = s_img
  return result
