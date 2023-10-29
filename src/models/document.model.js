const mongoose = require("mongoose");


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
    owner: {
      type: Number,
      ref: "User"
    }
  });
  
  DocumentSchema.plugin(autoIncrement.plugin, "Document")  

  const Document = connection.model(
    "Document",
    DocumentSchema
  );

  return Document;
}