FROM --platform=arm64 node:16.14.2-bullseye-slim
LABEL maintainer "swanzeyb <swanzeyb2001@gmail.com>"

# Copy Build & Entrpoint
RUN mkdir /app
COPY / /app
WORKDIR /app

# Install Node Dependencies
RUN npm install

# Install Python & Dependencies
RUN apt-get update && apt-get -y install python3 python3-pip
RUN pip3 install opencv-python numpy

ENTRYPOINT [ "node", "/app/apis/schedule/build/index.js" ]
