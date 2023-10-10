const mongoose = require("mongoose");


module.exports = (connection, autoIncrement) => {

  const VersionFileSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    document: {
      type: Number,
      ref: "Document"
    },
    editor: {
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