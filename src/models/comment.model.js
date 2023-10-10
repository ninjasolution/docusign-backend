const mongoose = require("mongoose");
const timestamps = require('mongoose-timestamp');


module.exports = (connection, autoIncrement) => {

  const CommentSchema = new mongoose.Schema({
    content: {
      type: String,
    },
    user: {
      type: Number,
      ref: "User"
    },
    versionFile: {
      type: Number,
      ref: "VersionFile"
    }
  });
  
  CommentSchema.plugin(autoIncrement.plugin, "Comment")  
  CommentSchema.plugin(timestamps);

  const Comment = connection.model(
    "Comment",
    CommentSchema
  );

  return Comment;
}