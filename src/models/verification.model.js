const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const VerificationSchema = new mongoose.Schema({
    capture: {
      type: String,
    },
    signature: {
      type: String,
    },
    version: {
      type: Number,
      ref: "Version"
    },
    userId: {
      type: Number,
      ref: "User"
    }
  });
  
  VerificationSchema.plugin(timestamps)
  VerificationSchema.plugin(autoIncrement.plugin, "Verification")  

  const Verification = connection.model(
    "Verification",
    VerificationSchema
  );

  return Verification;
}