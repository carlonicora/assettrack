#!/bin/bash

FILE=$1
FLAG=$2

# Validate that FILE is provided
if [ -z "$FILE" ]; then
  echo "Error: Please provide a JSON file path"
  echo "Usage: pnpm structure <FILE> [--api|--web]"
  exit 1
fi

# Convert to absolute path if relative
if [[ "$FILE" != /* ]]; then
  FILE="$(pwd)/$FILE"
fi

# Check if file exists
if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE"
  exit 1
fi

# Run based on flag
case "$FLAG" in
  --api)
    echo "Importing structure to API..."
    cd apps/api && node ~/Development/nestjs-cli/dist/import.js "$FILE"
    ;;
  --web)
    echo "Importing structure to Web..."
    cd apps/web && node ~/Development/nextjs-cli/dist/index.js "$FILE"
    ;;
  *)
    echo "Importing structure to API and Web..."
    cd apps/api && node ~/Development/nestjs-cli/dist/import.js "$FILE"
    cd ../web && node ~/Development/nextjs-cli/dist/index.js "$FILE"
    ;;
esac
