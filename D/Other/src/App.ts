import express from "express";
import open from "open";
import { fetchSizeFromArgs } from "./utils";

const app = express();
const port = 8080; // default port to listen
const usageMessage = "usage: ./xgui positive-integer";

app.set("view engine", "pug");
app.use(express.static("build"));

let sizeNum: number;
try {
  sizeNum = fetchSizeFromArgs(process.argv);
} catch {
  console.log(usageMessage);
  process.exit();
}

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.render("hexagonView", {
    size: sizeNum,
  });
});
// start the Express server
const server = app.listen(port, async () => {
  console.log(`server started at http://localhost:${port}`);
  open(`http://localhost:${port}`, { app: "google-chrome" });
});
app.post("/close", (req, res) => {
  process.exit();
});


