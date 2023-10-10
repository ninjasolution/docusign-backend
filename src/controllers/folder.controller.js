const db = require("../models");
const Folder = db.folder;
const config = require("../config/index")

exports.list = (req, res) => {
  Folder.find({ owner: req.userId })
    .exec((err, folders) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!folders) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: folders,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.update = (req, res) => {
  Folder.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Folder) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Folder,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Folder.deleteOne({ _id: req.params.id })
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
  const Folder = new Folder({
    ...req.body,
    owner: req.userId
  });
  Folder.save(async (err, Folder) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: Folder,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}
