const db = require("../models");
const Comment = db.comment;
const User = db.user;
const config = require("../config/index")

exports.list = (req, res) => {
  const version_id = req.params.version_id;
  // let options = {}

  // if (req.query.proposalId) {
  //   options.proposal = req.query.proposalId
  // }
  // if (req.query.user) {
  //   options.user = req.query.user
  // }

  Comment.find({ versionFile: version_id })
    .populate({ path: "userId" })
    .sort({ createdAt: -1 })
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


exports.create = async (req, res) => {
  const ncomment = new Comment({
    ...req.body,
    userId: req.userId
  });
  ncomment.save(async (err, comment) => {
    if (err) {
      console.log(err)
    .sort({ createdAt: -1 })
      return res.status(400).send({ message: err, status: "errors" });
    }
    const newcomment = await Comment.findOne({ _id: comment._id }).populate('userId');
    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: newcomment,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.members = async (req, res) => {
  const version_id = req.params.version_id;
  try {
    const authorIds = (await Comment.find({ versionFile: version_id }))?.map(d => d.userId);
    console.log(authorIds);
    // const users = await User.find();
    const users = await User.find({ _id: { $in: authorIds } });
    console.log(users);
    return res.status(200).send({
      message: config.RES_MSG_DATA_FOUND,
      data: users,
      status: config.RES_STATUS_SUCCESS,
    });
  } catch (err) {
    return res.status(400).send({ message: err.message, status: "errors" });
  }
}