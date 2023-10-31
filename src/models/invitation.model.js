const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const InvitationSchema = new mongoose.Schema({
    target: {
      type: Number,
      ref: "User"
    },
    documentId: {
      type: Number,
      ref: "Document"
    },
    permision: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Number,
      ref: "User"
    }
  });
  
  InvitationSchema.plugin(timestamps)
  InvitationSchema.plugin(autoIncrement.plugin, "Invitation")  

  const Invitation = connection.model(
    "Invitation",
    InvitationSchema
  );

  return Invitation;
}