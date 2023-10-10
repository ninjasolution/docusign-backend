const mongoose = require("mongoose");
const timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const NonceSchema = new mongoose.Schema({
    wallet: {
      type: String
    },
    nonce: {
      type: String
    }
  });
  NonceSchema.plugin(autoIncrement.plugin, "Nonce")
  NonceSchema.plugin(timestamps);

  const Nonce = connection.model(
    "Nonce",
    NonceSchema
  );
  return Nonce;
}
