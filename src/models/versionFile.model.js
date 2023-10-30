const mongoose = require("mongoose");


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
    document: {
      type: Number,
      ref: "Document"
    },
    userId: {
      type: Number,
      ref: "User"
    }
  });
  
  VersionFileSchema.plugin(autoIncrement.plugin, "VersionFile")  

  const VersionFile = connection.model(
    "VersionFile",
    VersionFileSchema
  );

  return VersionFile;
}