#!/bin/bash

# This script should be placed inside the extracted WAR folder.
# The script will repackage the contents into a new WAR file.

# Name of the new WAR file
NEW_WAR_NAME="mapstore.war"

# Make sure we're in the right directory (where the WAR files were extracted)
if [ ! -d "WEB-INF" ]; then
  echo "Error: Not in the extracted WAR directory. Make sure you're in the correct folder."
  exit 1
fi

# Repackage the contents back into a WAR file
echo "Repackaging the WAR file..."
zip -r "../$NEW_WAR_NAME" . > /dev/null

# Check if the new WAR file was created
if [ -f "../$NEW_WAR_NAME" ]; then
  echo "The WAR file has been successfully created: $NEW_WAR_NAME"
else
  echo "Error: Failed to create the WAR file."
  exit 1
fi
