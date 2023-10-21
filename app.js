const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
app.use(cors());

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
