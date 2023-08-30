#!/bin/bash

# This script is used to build the arm version of the project

# Docker login
docker login

# Array to store the sections that were built and pushed
built_sections=()

# Function to build and push a Docker image
build_and_push() {
    local folder="$1"
    local image_name="$2"
    local image_tag="$3"
    local dockerfile="$4"

    cd "$folder"
    # Check if changes are present
    git diff-index --quiet HEAD || {
        # Docker build
        docker build -t "$image_name:$image_tag" -f "$dockerfile" .
        # Docker Tag
        docker tag "$image_name:$image_tag" "zfranke/$image_name:$image_tag"
        # Docker Push
        docker push "zfranke/$image_name:$image_tag"
        built_sections+=("$folder")
    }
}

# Run build_and_push function for each section in parallel
build_and_push suggestion-box-frontend suggestions-frontend arm dockerfile.arm &
build_and_push suggestion-box-backend suggestions-backend arm dockerfile.arm &
build_and_push suggestion-box-database suggestions-database arm dockerfile.arm &

# Wait for all background processes to finish
wait

# Print the sections that were built and pushed
echo "Sections built and pushed: ${built_sections[@]}"

echo "All sections processed."
