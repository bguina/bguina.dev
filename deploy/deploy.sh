#!/usr/bin/env bash
# This script preps a new machine for deployment
# It's idempotent and can be run on an existing machine without risk

# Exit on any command error
set -e

DEPLOYED_DIR="./bguina.dev"

# Log into a new file
LOG_FILE="$DEPLOYED_DIR/deploy.$(date +%s).log"
mkdir -p "$(dirname "$LOG_FILE")"

{
  sudo unattended-upgrade

  echo '### Install certbot (https://certbot.eff.org/instructions?ws=other&os=ubuntufocal)'
  sudo apt-get install -y snapd
  sudo apt-get remove -y certbot
  sudo snap install --classic certbot
  sudo ln -fs /snap/bin/certbot /usr/bin/certbot
  sudo certbot certonly --standalone --non-interactive --agree-tos -m benoit.guina@gmail.com -d "$(hostname)"

  echo '### Copy certs locally'
  sudo cp -Rf "/etc/letsencrypt/live/$(hostname)" "$DEPLOYED_DIR/certs"
  sudo chown -R debian:debian "$DEPLOYED_DIR/certs"

  echo '### Add Docker APT repositories'
  # as documrented here: https://docs.docker.com/engine/install/debian/#install-using-the-repository
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  if ! test -f "/etc/apt/keyrings/docker.gpg"; then
  sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  fi
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y

  echo '### Install Docker'
  for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove -y $pkg; done
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose docker-compose-plugin

  echo '### Write env file'
  ENV_FILE="$DEPLOYED_DIR/deploy/env"
  {
    echo 'PORT=8080'
  } > "$ENV_FILE"

  echo '### Login to Docker'
  [[ -z "$GITHUB_ACTOR" ]] && echo "ERROR: No GH actor" && exit 1
  [[ -z "$GITHUB_TOKEN" ]] && echo "ERROR: No GH token" && exit 1
  echo "$GITHUB_TOKEN" | sudo docker login --password-stdin ghcr.io -u "$GITHUB_ACTOR"

  echo '### Start the container'
  sudo docker compose -f "$DEPLOYED_DIR/deploy/docker-compose.yml" --env-file "$ENV_FILE" up --force-recreate -d
  sudo docker image prune -f

} 2>&1 | tee -a -i "$LOG_FILE"
