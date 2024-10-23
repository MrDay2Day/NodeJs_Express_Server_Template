// Express Server
import express from "express";
const app = express();

// Cookie parser
import cookieParser from "cookie-parser";
// Compress response
import compression from "compression";
// Set and secure HTTP/HTTPS request headers
import helmet from "helmet";
// Detail Console logging
import morgan from "morgan";
// Cross-origin resource sharing
import cors from "cors";

import client from "prom-client";
import basicAuth from "express-basic-auth";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  helmet({
    frameguard: {
      action: "deny",
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    dnsPrefetchControl: false,
    referrerPolicy: {
      policy: "same-origin",
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
    ieNoOpen: false,
    permittedCrossDomainPolicies: {},
  })
);

app.use(
  helmet(),
  cookieParser(process.env.COOKIE_SECRET),
  express.urlencoded({ extended: true }),
  express.json({ limit: "100mb" }),
  compression(),
  morgan("combined")
);

// Prometheus

// Create a Registry to register the metrics
const register = new client.Registry();

// Default metrics for Node.js like memory usage and CPU usage
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.2, 0.5, 1, 2, 5], // Customize the buckets for response times
});

// Register custom metric
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to collect metrics for each request
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInSeconds = seconds + nanoseconds / 1e9;

    // Record duration of the request
    httpRequestDurationMicroseconds
      .labels(
        req.method,
        req.route ? req.route.path : req.path,
        String(res.statusCode)
      )
      .observe(durationInSeconds);
  });

  next();
});

// Basic Auth middleware
app.use(
  "/metrics",
  basicAuth({
    users: { prometheus: "prometheus" }, // Define the username and password
    challenge: true,
  })
);

// Expose the /metrics endpoint to Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export { app };
