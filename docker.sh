#!/bin/bash


# Define a function to bring services up
prod() {
    echo "Starting Production services..."
    docker-compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod.yml build
    docker-compose -f docker-compose-prod.yml up
}

up() {
    echo "Starting Development services..."
    docker-compose -f docker-compose-dev.yml up
}

# Define a function to bring services down and clean up resources
down() {
    echo "Remove all versions and services..."
    docker-compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
}

# Define a function to clean up and then start services
clean() {
    down
    up
}

# Check for the first argument to determine which function to run
case "$1" in
    up)
        up
        ;;
    down)
        down
        ;;
    clean)
        clean
        ;;
    prod)
        prod
        ;;
    *)
        echo "Usage: $0 {up|down|clean|prod}"
        exit 1
        ;;
esac
