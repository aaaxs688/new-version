import express from "express";
import bp from "./apis/bannerP";
import { readF, writeF } from "./apis/utils";
const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/getFoodCalories", (req, res) => {
  let result = readF(bp);
  res.send(result);
});

app.post("/setFoodCalories", (req, res) => {
  let { timeNumber, id, footGram } = req.body;
  let result = readF(bp);
  result.forEach((item, index) => {
    if (item.index === timeNumber) {
      item.list.forEach((value) => {
        if (value.id === id) {
          value.grams = footGram;
        }
      });
    }
  });
  writeF(bp, result);
  res.send({ message: "Successful" });
});
app.post("/delFoodCalories", (req, res) => {
  let { timeNumber, id, index } = req.body;
  let result = readF(bp);

  result.forEach((item, index) => {
    if (item.index === timeNumber) {
      item.list.forEach((value, i) => {
        if (value.id === id) {
          item.list.splice(i, 1);
        }
      });
    }
  });
  writeF(bp, result);
  res.send({  message: "Successful" });
});

app.get("/", (req, res) => {
  res.redirect("/foodCalories.html");
});

app.listen(3000, () => {
  console.log("localhost:3000/foodCalories.html");
});
