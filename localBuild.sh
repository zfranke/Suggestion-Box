#!/bin/bash

# This script is used to build a local version where each service is docker built locally

# Array to store the sections that were built and pushed
built_sections=()

# Function to just build the images
build() {
    local folder="$1"
    local image_name="$2"
    local image_tag="$3"
    local dockerfile="$4"

    cd "$folder"
    # Run the docker build
    docker build -t "$image_name:$image_tag" -f "$dockerfile" .
    built_sections+=("$folder")
}

# Run build function for each section in parallel
build suggestion-box-frontend suggestions-frontend local dockerfile &
build suggestion-box-backend suggestions-backend local dockerfile &
build suggestion-box-database suggestions-database local dockerfile &

# Wait for all background processes to finish
wait

# Print the sections that were built and pushed
echo "Sections built and pushed: ${built_sections[@]}"
echo "All sections processed."
