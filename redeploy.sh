# redeploy.sh
# Load environment variables from .env file
set -o allexport
source .env
set +o allexport

# Run docker-compose command
./docker.sh scale
