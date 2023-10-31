const db = require("../models");
const Folder = db.folder;
const Docuemnt = db.document;
const Invitation = db.invitation;

const config = require("../config/index")

exports.list = async (req, res) => {
  try {
    const documentIds = (await Invitation.find({ target: req.userId})).map(d => d.documentId);
    const folderIds = (await Docuemnt.find({ _id: { $in: documentIds}})).map(d => d.folder)
    Folder.find({ $or: [{owner: req.userId}, { _id: { $in: folderIds }}] })
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
  } catch (error) {
    return res.status(400).send({
      message: config.RES_MSG_DATA_NOT_FOUND,
      data: [],
      status: config.RES_STATUS_FAIL,
    });
  }
};

exports.getById = (req, res) => {
  Folder.findOne({ _id: req.params.id })
    .exec((err, folder) => {
      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!folder) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: folder,
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
  const folder = new Folder({
    ...req.body,
    owner: req.userId
  });
  folder.save(async (err, newfolder) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: newfolder,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}
