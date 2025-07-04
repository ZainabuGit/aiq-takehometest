#!/bin/bash
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose git

# Pull your repo
git clone https://github.com/your-username/your-aiq-repo.git /home/ubuntu/aiq-app
cd /home/ubuntu/aiq-app

# Run the app
sudo docker-compose up -d --build