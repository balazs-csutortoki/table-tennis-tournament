#!/bin/bash

echo "Stopping mosonudvar app..."
docker kill mosonudvar_app
echo "Removing mosonudvar app..."
docker rm mosonudvar_app

echo "Rebuilding mosonudvar app..."
npm run build
echo "Copying build files to mosonudvar directory..."
docker build -t mosonudvar .
echo "Running mosonudvar app..."
docker run -d  --name mosonudvar_app -p 8080:80 mosonudvar