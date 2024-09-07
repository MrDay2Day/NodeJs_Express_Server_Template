#!/bin/sh

source ./.env


deploy(){
    echo "Deploying $APP_NAME PM2 Cluster - Nodes $CLUSTER_SIZE"
    npx pm2 start pm2.config.js
    echo "Deployment successful $APP_NAME:$CLUSTER_SIZE"
}

restart(){
    echo "Deploying $APP_NAME PM2 Cluster - Nodes $CLUSTER_SIZE"
    npx pm2 restart $APP_NAME
    echo "Deployment successful $APP_NAME:$CLUSTER_SIZE"
}

kill(){
    echo "Stopping $APP_NAME:$CLUSTER_SIZE PM2 Cluster"
    npx pm2 kill
    echo "Successfully stopped $APP_NAME:$CLUSTER_SIZE"
}


case "$1" in

    deploy)
        deploy
        ;;

    restart)
        restart
        ;;

    stop)
        kill
        ;;
    *)
        echo "Invalid Input: '$1'"
        echo "Expected Input - 'deploy' | 'restart' | 'stop'"
        exit 1
        ;;

esac