const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');

module.exports = (connection, autoIncrement) => {

  const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      min: 3,
      max: 25
    },
    email: {
      type: String,
    },
    status: {
      type: Number,
    },
    levelName: {
      type: String,
    },
    externalUserId: {
      type: String,
    },
    applicantId: {
      type: String,
    },
    description: {
      type: String,
      max: 500
    },
    socialUrl: {
      type: Object,
      default: {}
    },
    wallet: {
      type: String,
      // default: ""
      // unique: true
    },
    projects: [{
      type: Number,
      ref: "Project"
    }],
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneNumber: {
      type: String,
      default: ""
    },
    countrycode: {
      type: String,
      default: ""
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    image: {
      type: String
    },
    tier: {
      type: Object
    },
    nonce: {
      type: Number,
      default: 0
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    changePasswordAt: {
      type: Date,
      default: Date.now
    },
    referralCode: {
      type: String,
      default: ""
    },
    sponsorCode: {
      type: String,
      default: ""
    },
    role: {
      type: Number,
      ref: "Role"
    },
    transactions: [
      {
        type: Number,
        ref: "Transaction"
      }
    ],
    tokens: [
      {
        type: Number,
        ref: "Token"
      }
    ]
  })

  UserSchema.plugin(timestamps)
  UserSchema.plugin(autoIncrement.plugin, "User")

  const User = connection.model(
    "User",
    UserSchema
  );

  return User;
}
