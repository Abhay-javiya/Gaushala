require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Require routes ...
const animalRoutes = require("./routes/animalRoutes");

const app = express();

// Middleware ...
app.use(cors());
app.use(express.json());

// Animal API ...
app.use("/api/animals", animalRoutes);

// Test route ...
app.get("/", (req, res) => {
  res.send("Gaushala API is running!");
});

// Start server after database connects ...
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
