#!/bin/bash
set -e

cd "$(dirname "$0")/.."

BACKEND_DIR="backend"
OUTPUT_DIR="backend"
ZIP_FILE="lambda.zip"
TEMP_DIR=".package_tmp"

echo "Packaging Lambda function..."

# Clean up old files
rm -f $OUTPUT_DIR/$ZIP_FILE
rm -rf $TEMP_DIR

# Create temp directory for dependencies
mkdir -p $TEMP_DIR

# Install dependencies into temp folder if requirements.txt exists
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  echo "Installing dependencies from requirements.txt..."
  pip install -r $BACKEND_DIR/requirements.txt --target $TEMP_DIR
fi

# Copy Python source files into temp folder
cp $BACKEND_DIR/*.py $TEMP_DIR/

# Zip everything
cd $TEMP_DIR
zip -r ../$OUTPUT_DIR/$ZIP_FILE . > /dev/null
cd ..

# Clean up
rm -rf $TEMP_DIR

echo "Lambda packaged at $OUTPUT_DIR/$ZIP_FILE"
