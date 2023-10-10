const db = require("../models");
const Document = db.document;
const config = require("../config/index")

exports.list = (req, res) => {
  Document.find({ owner: req.userId })
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


exports.create = (req, res) => {
  const Document = new Document({
    ...req.body,
    owner: req.userId
  });
  Document.save(async (err, Document) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: Document,
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

