#!/bin/zsh
GREEN='\033[0;32m'
NC='\033[0m'
print () { echo "${GREEN}$1${NC}" }

print "Package $1"
print "Preparing..."
cd "./apps/$1"
rm "$1.tar" > /dev/null 2>&1

print "Stage 1/5"
(set -x; yarn build)

print "Stage 2/5"
# yarn build-img
(set -x; docker build -t "swanzeyb/$1" .)

print "Stage 3/5"
# yarn save-img
(set -x; docker save "swanzeyb/$1" > "$1.tar")

print "Stage 4/5"
# yarn transfer-img
(set -x; rsync -avz -e "ssh -i ~/.ssh/id_rsa" --progress "./$1.tar" "docker@rpi.benswanzey.com:/home/docker/$1.tar")

print "Stage 5/5"
# yarn load-on-remote
(set -x; ssh -i ~/.ssh/id_rsa docker@rpi.benswanzey.com "docker load -i $1.tar")

print "$1 Finished Packaging"
cd ..