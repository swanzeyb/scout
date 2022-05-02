#!/bin/zsh
rsync -avz -e "ssh -i ~/.ssh/id_rsa" --progress ./docker-compose.yml docker@rpi.benswanzey.com:/home/docker/docker-compose.yml