const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// GET / - Welcome route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my Node.js and Express server!");
});

// GET /about - Student information
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Kondapelli Madhukar",
    section: "YOUR_SECTION"
  });
});

// GET /time - Current date and time
app.get("/time", (req, res) => {
  res.status(200).json({
    currentTime: new Date().toString()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
