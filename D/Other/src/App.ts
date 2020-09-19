import express from "express";
import open from "open";
const app = express();
const port = 8080; // default port to listen
app.set("view engine", "pug");

const size = process.argv[2];
const sizeNum = size && parseFloat(size);

if (sizeNum && sizeNum > 0) {
  // define a route handler for the default home page
  app.get("/", (req, res) => {
    res.render("hexagonView", {
      size: sizeNum,
    });
  });
  // start the Express server
  app.listen(port, async () => {
    console.log(`server started at http://localhost:${port}`);
    open(`http://localhost:${port}`);
  });
  app.on('closed', () => {
    console.log('window closed');
  })
} else {
  console.log("usage: ./xgui positive-integer");
}