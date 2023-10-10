const mongoose = require("mongoose");


module.exports = (connection, autoIncrement) => {

  const WhiteListSchema = new mongoose.Schema({
    address: {
      type: String,
    },
    percent: {
      type: Number
    },
    proof: [],
    allocation: Object,
    project: {
      type: Number,
      ref: "Project"
    }
  });
  
  WhiteListSchema.plugin(autoIncrement.plugin, "WhiteList")  

  const WhiteList = connection.model(
    "WhiteList",
    WhiteListSchema
  );

  return WhiteList;
}