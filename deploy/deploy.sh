#!/usr/bin/env bash
# This script preps a new machine for deployment
# It's idempotent and can be run on an existing machine without risk

# Exit on any command error
set -e

# Log into a new file
LOG_FILE=./logs/deploy.$(date +%s).log
mkdir -p "$(dirname "$LOG_FILE")"

{
  sudo unattended-upgrade

  echo '### Install certbot (https://certbot.eff.org/instructions?ws=other&os=ubuntufocal) ###'
  sudo apt-get install -y snapd
  sudo apt-get remove -y certbot
  sudo snap install --classic certbot
  sudo ln -fs /snap/bin/certbot /usr/bin/certbot
  sudo certbot certonly --standalone --non-interactive --agree-tos -m benoit.guina@gmail.com -d "$(hostname)"

  echo '### Copy certs locally ###'
  sudo cp -Rf "/etc/letsencrypt/live/$(hostname)" ./certs
  sudo chown -R debian:debian ./certs

  echo '### Add Docker APT repositories ###'
  # as documrented here: https://docs.docker.com/engine/install/debian/#install-using-the-repository
  sudo apt-get update
  sudo apt-get install ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  if ! test -f "/etc/apt/keyrings/docker.gpg"; then
  sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  fi
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update

  echo '### Install Docker ###'
  for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  echo '### Login to Docker ###'
  [[ -z "$GITHUB_ACTOR" ]] && echo "ERROR: No GH actor" && exit 1
  [[ -z "$GITHUB_TOKEN" ]] && echo "ERROR: No GH token" && exit 1
  echo "$GITHUB_TOKEN" | sudo docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

  echo '### Pull image ###'
  sudo docker pull ghcr.io/bguina/bgcv:main
  sudo docker image prune -f

  echo '### Write env file ###'
  ENV_FILE=deploy/env
  {
    echo ''
  } > "$ENV_FILE"

  echo '### Start the container ###'
  sudo docker compose -f deploy/docker-compose.yml --env-file "$ENV_FILE" up --force-recreate -d

} 2>&1 | tee -a -i "$LOG_FILE"
