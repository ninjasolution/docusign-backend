const db = require("../models");
const Document = db.document;
const Invitation = db.invitation;
const VersionFile = db.versionFile;

const config = require("../config/index")

exports.list = async (req, res) => {
  const documentIds = (await Invitation.find({ target: req.userId })).map(d => d.documentId)
  const folder_id = req.params.folder_id;
  Document.find({
    folder: folder_id,
    $or: [
      { _id: { $in: documentIds } },
      { owner: req.userId }
    ]
  })
    .sort({ createdAt: -1 })
    .exec(async (err, documents) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }
      try {
        const updateddocuments = await Promise.all(
          documents.map(async d => {
            const count = await VersionFile.count({ document: (d._doc?._id || d._id) })
            return {
              ...(d._doc || d),
              count
            }
          })
        )
        return res.status(200).send({
          message: config.RES_MSG_DATA_FOUND,
          data: updateddocuments,
          status: config.RES_STATUS_SUCCESS,
        });
      } catch (error) {
        return res.status(400).send({
          message: error.message,
          data: [],
          status: config.RES_STATUS_FAIL,
        });
      }

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


exports.recentlist = async (req, res) => {
  const documentIds = (await Invitation.find({ target: req.userId })).map(d => d.documentId)
  Document.find({
    $or: [
      { _id: { $in: documentIds } },
      { owner: req.userId }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .exec(async (err, documents) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }
      try {
        const updateddocuments = await Promise.all(
          documents.map(async d => {
            const count = await VersionFile.count({ document: (d._doc?._id || d._id) })
            return {
              ...(d._doc || d),
              count
            }
          })
        )
        return res.status(200).send({
          message: config.RES_MSG_DATA_FOUND,
          data: updateddocuments,
          status: config.RES_STATUS_SUCCESS,
        });
      } catch (error) {
        return res.status(400).send({
          message: error.message,
          data: [],
          status: config.RES_STATUS_FAIL,
        });
      }

    })
};


exports.create = (req, res) => {
  // console.log('^^document', req.body);
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


exports.counttotallist = async (req, res) => {
  // console.log('^^', req.userId);
  const invitedDocIds = (await Invitation.find({ target: req.userId })).map(d => d.documentId);
  Document.count({ $or: [{ owner: req.userId }, { _id: { $in: invitedDocIds } }] })
    .exec((err, count) => {

      if (err) {
        // console.log('^^err', err);
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: count,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.countinvitedlist = async (req, res) => {
  Invitation.count({ target: req.userId })
    .exec((err, count) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: count,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};
