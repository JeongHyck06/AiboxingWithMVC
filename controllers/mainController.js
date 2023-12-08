//mainControllers.js

const path = require("path");

exports.getIndex = (req, res) => {
  res.render(path.join(__dirname, "..", "views", "index.ejs"));
};
