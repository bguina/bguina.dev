#!/usr/bin/env bash

sudo cp -Rf --dereference "/etc/letsencrypt/live/$(hostname)" /home/debian/certs
sudo chown -R debian:debian "/home/debian/certs/$(hostname)"
sudo docker restart "$(sudo docker ps -q)"
