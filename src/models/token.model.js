const mongoose = require("mongoose");
const timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const TokenSchema = new mongoose.Schema({
    user: {
      type: Number,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["SMS", "Email"],
    },
    token:  {
      type: String,
      require: true
    }
  });
  TokenSchema.plugin(autoIncrement.plugin, "Token")
  TokenSchema.plugin(timestamps);

  const Token = connection.model(
    "Token",
    TokenSchema
  );
  return Token;
}
