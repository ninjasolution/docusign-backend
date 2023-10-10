const db = require("../models");
const Comment = db.comment;
const config = require("../config/index")

exports.list = (req, res) => {

  let options = {}

  if (req.query.proposalId) {
    options.proposal = req.query.proposalId
  }
  if (req.query.user) {
    options.user = req.query.user
  }

  Comment.find(options)
    .populate({ path: "user", select: "wallet image" })
    .exec((err, comments) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!comments) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: comments,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.update = (req, res) => {
  Comment.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Comment) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Comment,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Comment.deleteOne({ _id: req.params.id })
    .exec((err) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_DELETE_FAIL });
        return;
      }
      return res.status(200).send({
        message: config.RES_MSG_DELETE_SUCCESS,
        status: config.RES_STATUS_SUCCESS,
      });

    })
};


exports.create = (req, res) => {
  const comment = new Comment({
    ...req.body,
    user: req.userId
  });
  comment.save(async (err, comment) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: comment,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}
