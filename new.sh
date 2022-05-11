#!/bin/zsh
GREEN='\033[0;32m'
NC='\033[0m'
print () { echo "${GREEN}$1${NC}" }
SCRIPT_PATH="${0:A:h}"

print "New Package $1"

print "Stage 1/3"
cd /tmp
(set -x; gh repo clone swanzeyb/app-template)
cp -r ./app-template "${SCRIPT_PATH}/apps/$1"
rm -rf ./app-template

print "Stage 2/3"
cd "${SCRIPT_PATH}/apps/$1"
cp package.json temp.json
rm package.json
jq -r --arg NAME $1 '.name |= $NAME' temp.json > package.json
rm temp.json
print "Renamed package.json name to $1"

print "Stage 3/3"
yarn

# cd ../..
print "Finished New Package $1"