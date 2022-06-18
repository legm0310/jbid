#!/bin/bash

# set -e

# name: docker container name
name="$1"
wallet_name="$2"
wallet_key="$3"
seed="$4"

echo "<< Process Start >>\n"

echo "${wallet_name}"
echo "${wallet_key}"

# Generate DID with params & Export ouput file
docker exec -iu 0 "$name" python3 /home/indy/generate_did.py "${wallet_name}" "${wallet_key}" "${seed}"

# Copy output file to Deploy folder
docker cp "$name":/home/indy/"${wallet_name}"_gen_did.json /home/deploy
echo "[Log File Copy]"

docker exec -iu 0 "${name}" rm /home/indy/"${wallet_name}"_gen_did.json
echo "[Remove log file from 'Docker']"

echo "<< Process End >>\n"
