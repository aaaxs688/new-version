// import express server 
// import json path （bp）
// import functionof readF and writeF
import express from "express";
import bp from "./apis/bannerP";
import { readF, writeF } from "./apis/utils";


// creat express server
const app = express();

// set path
app.use(express.static(__dirname + "/public"));

// use json
app.use(express.json());

// add interface
app.get("/getFoodCalories", (req, res) => {
  let result = readF(bp);
  res.send(result);
});

app.post("/setFoodCalories", (req, res) => {
  let { timeNumber, id, footGram, unit } = req.body;
  // Get the data passed from the front end from req.body
  let result = readF(bp);
  // go through the data    
  result.forEach((item, index) => {
    if (item.index === timeNumber) {
      item.list.forEach((value) => {
        if (value.id === id) {
          //  change data
          value.grams = footGram;
          value.unit = unit;
        }
      });
    }
  });
  // write data
  writeF(bp, result);
  // send is the return value of the interface
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
//redirect
app.get("/", (req, res) => {
  res.redirect("/foodCalories.html");
});
// listen 3000 interface
app.listen(3000, () => {
  console.log("localhost:3000/foodCalories.html");
});
