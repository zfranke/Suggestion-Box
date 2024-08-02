#!/bin/bash

# Docker-compose down then up
docker-compose down
./localBuild.sh
docker-compose up -d
