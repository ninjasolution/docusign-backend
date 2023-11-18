const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const VersionFileSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    fileName: {
      type: String,
    },
    version: {
      type: Number,
      default: 0.1
    },
    isselected: {
      type: Boolean,
      default: false
    },
    iscompleted: {
      type: Boolean,
      default: false
    },
    verifyDoc: {
      type: String
    },
    document: {
      type: Number,
      ref: "Document"
    },
    userId: {
      type: Number,
      ref: "User"
    }
  });
  
  VersionFileSchema.plugin(timestamps)
  VersionFileSchema.plugin(autoIncrement.plugin, "VersionFile")  

  const VersionFile = connection.model(
    "VersionFile",
    VersionFileSchema
  );

  return VersionFile;
}