const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));
    
app.set("trust proxy", 1);

const path = require("path");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");

app.use("/", express.static("uploads"));

app.use(cookieParser());

app.use(helmet());

app.use(express.static(path.join(__dirname,"public")));
if(process.env.NODE_ENV === "development")
{
    app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

// Routes for users
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRouter); 
app.use("/api/posts", postRouter); 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;