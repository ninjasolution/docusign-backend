const mongoose = require("mongoose");


module.exports = (connection, autoIncrement) => {

  const InvitationSchema = new mongoose.Schema({
    target: {
      type: Number,
      ref: "User"
    },
    invitation: {
      type: Number,
      ref: "Invitation"
    },
    permision: {
      type: Number,
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
  
  InvitationSchema.plugin(autoIncrement.plugin, "Invitation")  

  const Invitation = connection.model(
    "Invitation",
    InvitationSchema
  );

  return Invitation;
}