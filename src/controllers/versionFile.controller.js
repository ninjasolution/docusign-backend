const db = require("../models");
const VersionFile = db.VersionFile;
const config = require("../config/index")

exports.list = (req, res) => {
  VersionFile.find({ owner: req.userId })
    .exec((err, versionFiles) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!versionFiles) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: versionFiles,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.create = (req, res) => {
  const VersionFile = new VersionFile({
    ...req.body,
    editor: req.userId
  });
  VersionFile.save(async (err, VersionFile) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: VersionFile,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.update = (req, res) => {
  VersionFile.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, VersionFile) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: VersionFile,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  VersionFile.deleteOne({ _id: req.params.id })
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

