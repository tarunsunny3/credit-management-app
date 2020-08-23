const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var userSchema = new Schema({
  name: String,
  email: String,
  accNumber: Number,
  creditAmount: Number,
});
module.exports = mongoose.model("User", userSchema);
