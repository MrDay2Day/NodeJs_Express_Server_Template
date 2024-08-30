require("dotenv").config();

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      script: "code/server.js",
      exec_mode: "cluster",
      watch: false,
      instances: process.env.PM2_CLUSTER_SIZE,
    },
  ],
};
