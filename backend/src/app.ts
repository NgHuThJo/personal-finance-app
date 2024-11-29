// Third party
import http from "node:http";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "#backend/routers/api.js";
import { createContext } from "./routers/trpc.js";
import { SocketService } from "./services/socket-io.js";
import logger from "#backend/utils/logger.js";

// Entry point file
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
export const socketService = new SocketService(server);

server.listen(port, () => {
  logger.debug(`Server listening on port ${port}`);
});

// Cloudinary and multer config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: "uploads",
    transformation: [
      {
        width: 720,
        height: 720,
        crop: "fit",
      },
    ],
  }),
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    // origin: process.env.PROXY_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
app.post("/upload", upload.single("file"), (req, res, _next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const getPublicId = (imageURL: string) => {
    const [, publicIdWithExtensionName] = imageURL.split("uploads/");
    const extensionName = path.extname(publicIdWithExtensionName);
    const publicId = publicIdWithExtensionName.replace(extensionName, "");
    return publicId;
  };

  const { path: imagePath }: { path: string } = file;
  const publicId = getPublicId(imagePath);

  console.log(publicId);

  res
    .status(200)
    .json({ message: "File uploaded successfully", path: imagePath, publicId });
});

app.use(
  "/api",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, socketService }),
  }),
);

// Error handler
const errorHandler: ErrorRequestHandler = (err, _req, _res, _next) => {
  logger.error(err);
};

app.use(errorHandler);
