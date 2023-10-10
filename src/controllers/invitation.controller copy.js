const db = require("../models");
const Invitation = db.invitation;
const config = require("../config/index")

exports.list = (req, res) => {
  Invitation.find({ owner: req.userId })
    .exec((err, invitations) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!invitations) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: invitations,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.create = (req, res) => {
  const Invitation = new Invitation({
    ...req.body,
    owner: req.userId
  });
  Invitation.save(async (err, Invitation) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: Invitation,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.update = (req, res) => {
  Invitation.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Invitation) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Invitation,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Invitation.deleteOne({ _id: req.params.id })
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

