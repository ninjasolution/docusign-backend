const mongoose = require("mongoose");


module.exports = (connection, autoIncrement) => {

  const FolderSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    owner: {
      type: Number,
      ref: "User"
    }
  });
  
  FolderSchema.plugin(autoIncrement.plugin, "Folder")  

  const Folder = connection.model(
    "Folder",
    FolderSchema
  );

  return Folder;
}