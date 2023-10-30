const db = require("../models");
const VersionFile = db.versionFile;
const config = require("../config/index")

exports.list = (req, res) => {
  const document_id = req.params.document_id;
  VersionFile.find({ document: document_id })
    .sort({ createdAt: -1 })
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

exports.getById = (req, res) => {
  const id = req.params.id;
  VersionFile.findOne({ _id: id })
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
  console.log('^^', res.locals.fileName);
  const versionFile = new VersionFile({
    document: req.body.document_id,
    ...req.body,
    fileName: res.locals.fileName,
    userId: req.userId
  });
  versionFile.save(async (err, vesion) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: vesion,
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

