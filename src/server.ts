import express from "express";
import cors from "cors";
import compression from "compression";

const app = express();
const PORT = 3001;

// Enable GZIP compression for all responses
app.use(compression());
app.use(cors());
app.use(express.json());

// Set cache headers for static assets
app.use(
  express.static("public", {
    maxAge: "1d", // Cache static assets for 1 day
    etag: true,
    lastModified: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with compression enabled`);
});
