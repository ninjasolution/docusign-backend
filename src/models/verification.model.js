const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const VerificationSchema = new mongoose.Schema({
    capture: {
      type: Buffer,
    },
    signature: {
      type: Buffer,
    },
    version: {
      type: Number,
      ref: "VersionFile"
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