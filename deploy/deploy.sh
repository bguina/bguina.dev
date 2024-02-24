#!/usr/bin/env bash
# This script preps a new machine for deployment
# It's idempotent and can be run on an existing machine without risk

# Exit on any command error
set -e

DEPLOYED_DIR="./bguina.dev"

# Log into a new file
LOG_FILE="$DEPLOYED_DIR/deploy.$(date +%s).log"
LETSENCRYPT_CONF_FILE="/etc/letsencrypt/renewal/$(hostname).conf"
mkdir -p "$(dirname "$LOG_FILE")"

{
  sudo unattended-upgrade

  echo '### Install certbot (https://certbot.eff.org/instructions?ws=other&os=ubuntufocal)'
  sudo apt-get install -y snapd
  sudo apt-get remove -y certbot
  sudo snap install --classic certbot
  sudo ln -fs /snap/bin/certbot /usr/bin/certbot

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

  if ! [ -f "$LETSENCRYPT_CONF_FILE" ]; then
    echo '### Request certs'
    sudo certbot certonly --standalone --non-interactive --staple-ocsp -m benoit.guina@gmail.com --agree-tos \
      -d "$(hostname)" -d "www.$(hostname)"
  fi

  echo '### Setup certs renewal'
  grep -q 'renew_hook =' "$LETSENCRYPT_CONF_FILE" || \
    echo "renew_hook = $(realpath $DEPLOYED_DIR)/deploy/renew_hook.sh" | sudo tee -a "$LETSENCRYPT_CONF_FILE"
  sudo certbot certonly --standalone --non-interactive --agree-tos -m benoit.guina@gmail.com \
    -d "$(hostname)" -d "www.$(hostname)"

  echo '### Login to Docker'
  [[ -z "$GITHUB_ACTOR" ]] && echo "ERROR: No GH actor" && exit 1
  [[ -z "$GITHUB_TOKEN" ]] && echo "ERROR: No GH token" && exit 1
  echo "$GITHUB_TOKEN" | sudo docker login --password-stdin ghcr.io -u "$GITHUB_ACTOR"

  echo '### Start the container'
  mkdir -p "$DEPLOYED_DIR/resources/public/css"
  mkdir -p "$DEPLOYED_DIR/resources/public/pdf"
  (cd "$DEPLOYED_DIR/deploy" && sudo docker-compose pull)
  sudo docker compose -f "$DEPLOYED_DIR/deploy/docker-compose.yml" --env-file "$ENV_FILE" up -d \
    --force-recreate --remove-orphans
  sudo docker image prune -f

} 2>&1 | tee -a -i "$LOG_FILE"
