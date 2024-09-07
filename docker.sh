#!/bin/bash

source ./.env

# Define a function to bring services up
prod() {
    echo "Starting Production services clean..."
    docker-compose -f docker-compose-prod.yml --build --no-cache
    docker-compose -f docker-compose-prod.yml up -d
}

prod-up() {
    echo "Starting Production services..."
    docker-compose -f docker-compose-prod.yml --build --no-cache
    docker-compose -f docker-compose-prod.yml up -d
}

scale() {
    # x=$1
    echo "Starting Production services with scaling..."
    docker-compose -f docker-compose-prod-scale.yml --build --no-cache
    docker-compose -f docker-compose-prod-scale.yml up -d --scale node-server=$CLUSTER_SIZE
    echo "Production Container deployed with $CLUSTER_SIZE node(s)."
}

dev() {
    echo "Starting Development services..."
    docker-compose -f docker-compose-dev.yml --build --no-cache
    docker-compose -f docker-compose-dev.yml up -d
}

# Define a function to bring services down and clean up resources
remove() {
    echo "Remove all versions and services..."
    docker-compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod-scale.yml down --volumes --rmi all --remove-orphans
}

# Define a function to clean up and then start services
clean() {
    remove
    up
}

# Check for the first argument to determine which function to run
case "$1" in
    dev)
        dev
        ;;
    remove)
        remove
        ;;
    clean)
        clean
        ;;
    prod)
        prod
        ;;
    prod-up)
        prod-up
        ;;
    scale)
        scale
        # scale $2
        ;;
    *)
        echo "Invalid Input: '$1'"
        echo "Expected Input - 'dev' | 'remove' | 'clean' | 'prod' | 'prod-up' | 'scale'"
        exit 1
        ;;
esac
