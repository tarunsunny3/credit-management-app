require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const User = require("./models/User");

app.use(express.static(path.join(__dirname, "build")));

app.use(bodyParser.json());
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDb connected successfully"));
app.get("/user/", (req, res) => {
  const accNumber = req.params.accountNumber;
  User.find({}, (error, users) => {
    if (!error) {
      res.send(users);
    } else {
      console.log(error);
    }
  });
});
app.get("/user/:accountNumber", (req, res) => {
  const accNumber = req.params.accountNumber;
  User.find({ accNumber }, (error, user) => {
    if (!error) {
      res.send(user);
    } else {
      console.log(error);
    }
  });
});
app.post("/newUser", (req, res) => {
  const data = req.body;
  const newUser = new User(data);
  newUser.save();
  res.send(newUser);
});
app.post("/user/transfer", async (req, res) => {
  const fromAccNumber = req.body.fromAcc;
  const toAccNumber = req.body.toAcc;
  const amount = Number(req.body.amount);
  var flag1 = 0,
    flag2 = 0;
  try {
    const user1 = await User.findOne({ accNumber: fromAccNumber });
    if (user1 !== null) {
      flag1 = 1;
    }
  } catch (error) {
    console.log(error);
  }
  try {
    const user2 = await User.findOne({ accNumber: toAccNumber });
    if (user2 !== null) {
      flag2 = 1;
    }
  } catch (error) {
    console.log(error);
  }

  if (flag1 === 1 && flag2 === 1) {
    try {
      const found = await User.findOneAndUpdate(
        { accNumber: fromAccNumber },
        { $inc: { creditAmount: -amount } }
      );
      const toAccount = await User.findOneAndUpdate(
        { accNumber: toAccNumber },
        { $inc: { creditAmount: amount } }
      );
      res.send("Success");
    } catch (error) {
      console.log("Error");
    }
  } else {
    if (flag1 === 0 && flag2 === 0) {
      res.send(
        "Both Sender and Beneficiary account numbers are wrong...Please Try again"
      );
    } else if (flag1 === 0) {
      res.send("Sender Account Number is wrong...Please Try again");
    } else {
      res.send("Recepient Account Number is wrong...Please Try again");
    }
  }
});
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 5000, "0.0.0.0", (req, res) => {
  console.log("Server started successfully");
});
