export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      USE_REDIS: string;
      REDIS_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASS: string;
      LOCAL_URL: string;
      JWT_TOKEN_EXPIRE: string;
      SALT: string;
      DB_TYPE: "mysql" | "postgres" | "mongo";
      //MongoDB
      MONGO_ACTIVE: string;
      MONGO_URL: string;
      MONGO_CLUSTER: string;
      MONGO_USER: string;
      MONGO_PASSWORD: string;
      MONGO_DEFAULT_DATABASE: string;
      ADMIN_DEFAULT_DATABASE: string;
      // PostGres SQL
      PG_ACTIVE: string;
      PG_USER: string;
      PG_HOST: string;
      PG_DB: string;
      PS_PASS: string;
      PG_PORT: any | number;
      // MySQL
      MYSQL_ACTIVE: string;
      MYSQL_USER: string;
      MYSQL_HOST: string;
      MYSQL_DB: string;
      MYSQL_PASS: string;
      MYSQL_PORT: any | number;
      // AWS SES Service
      EMAIL_SENDING_ADDRESS: string;
      EMAIL_SHORT_NAME: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_SES_SEND_LIMIT_PER_SEC: string;
      AWS_SES_QUEUE_WAIT_TIME: string;
    }
  }
}
