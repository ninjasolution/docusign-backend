const db = require("../models");
const Document = db.document;
const config = require("../config/index")

exports.list = (req, res) => {
  const folder_id = req.params.folder_id;
  Document.find({ folder: folder_id })
    .sort({ createdAt: -1 })
    .exec((err, documents) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!documents) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: documents,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.getById = (req, res) => {
  Document.findOne({ _id: req.params.id })
    .exec((err, document) => {
      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!document) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: document,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};



exports.create = (req, res) => {
  console.log('^^document', req.body);
  const document = new Document({
    ...req.body,
    owner: req.userId
  });
  document.save(async (err, doc) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: doc,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.update = (req, res) => {
  Document.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Document) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Document,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Document.deleteOne({ _id: req.params.id })
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

