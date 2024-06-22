import express from "express";
import dotenv from "dotenv";
import DB_connect from "./db/index.js";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3003;

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Welcome to the Student Portal");
});

//routes
import userRoutes from "./routes/userRoutes.js";

app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

DB_connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is running at port ${port}`);
    });
  })
  .catch((error) => {
    console.log("connection error", error);
  });
