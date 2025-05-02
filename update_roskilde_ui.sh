#!/bin/bash

# Define the project directory
PROJECT_DIR="/home/joel/Documents/node/roskilde_ui_node"

# Navigate to the project directory
cd "$PROJECT_DIR" || { echo "Directory not found!"; exit 1; }

echo "Stopping any running instance of the app..."

# Find the PID(s) of node processes running src/index.js in that directory and kill them
PIDS=$(pgrep -f "node $PROJECT_DIR/src/index.js")
if [ -n "$PIDS" ]; then
  echo "Killing process(es): $PIDS"
  kill $PIDS
else
  echo "No running instance found."
fi

echo "Pulling latest changes from Git..."
git pull

echo "Starting the app with nohup..."
nohup node src/index.js > output.log 2>&1 &

echo "Done! App is running in the background."
