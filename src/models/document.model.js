const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const DocumentSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    description: {
      type: String
    },
    folder: {
      type: Number,
      ref: "Folder"
    },
    curretVersion: {
      type: Number,
      ref: "VersionFile"
    },
    token: {
      type: Number,
      default: -1
    },
    owner: {
      type: Number,
      ref: "User"
    }
  });

  DocumentSchema.plugin(timestamps)
  DocumentSchema.plugin(autoIncrement.plugin, "Document")  

  const Document = connection.model(
    "Document",
    DocumentSchema
  );

  return Document;
}