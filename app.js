const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const qs = require("qs");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const { connectDB } = require("./Config/dbConfig");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");

// ! start express app & connect to db

const app = express();

// ! Middlewares

app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const rateLimitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

// ! Security meddilewares

app.use(helmet()); // * setting security headers

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com; ` +
      `style-src 'self' https://api.mapbox.com https://fonts.googleapis.com 'nonce-${nonce}'; ` +
      `font-src https://fonts.gstatic.com; ` +
      `connect-src 'self' https://api.mapbox.com; ` +
      `img-src 'self' https://api.mapbox.com data:; ` +
      `worker-src blob:`
  );
  res.locals.nonce = nonce;
  next();
});
app.use("/api", rateLimitter); // * rate limiting
// * prevent http parameter pollution

// ! Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// ! Query Passer
app.set("query parser", "extended"); //  to configure how query strings in incoming HTTP requests are parsed

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});
// ! Routes
app.use("/api/v1/users", userRouter);

// ! handling unhandled routes
const server = app.use((req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ! Global error handling middleware

app.use(globalErrorHandler);

// ! Unhandled Rejection and uncaught exception handling

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  console.log(err.name, err.message);
  /* server.close(() => {
    process.exit(1);
  }); */
});

const port = process.env.PORT || 3000;
connectDB();
app.listen(port, () => {
  console.log(`Server started on port ${port} `);
});
