const db = require("../models");
const Document = db.document;
const User = db.user;
const Invitation = db.invitation;
const VersionFile = db.versionFile;

const config = require("../config/index")

exports.list = async (req, res) => {
  const { sortby, title, createdAt, page, keyword } = req.query;
  let sortobj = {};
  switch (sortby) {
    case 'title':
      sortobj = { title, createdAt };
      break;
    case 'createdAt':
      sortobj = { createdAt, title };
      break;

    default:
      break;
  }

  const documentIds = (await Invitation.find({ target: req.userId })).map(d => d.documentId)
  const folder_id = req.params.folder_id;
  Document.find({
    folder: folder_id,
    $or: [
      { _id: { $in: documentIds } },
      { owner: req.userId }
    ]
  })
    .sort(sortobj)
    .exec(async (err, documents) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }
      try {
        const updateddocuments = await Promise.all(
          documents.map(async d => {
            const count = await VersionFile.count({ document: (d._doc?._id || d._id) })
            const completeVersion = await VersionFile.findOne({ document: (d._doc?._id || d._id), iscompleted: true });
            const lastVersion = await VersionFile.findOne({ document: (d._doc?._id || d._id) }).sort({ createdAt: -1 }).limit(1);
            return {
              ...(d._doc || d),
              count,
              lastVersion,
              completeVersion
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
    .populate("owner", "-_id name email")
    .populate("folder", "-_id title description createdAt")
    .exec((err, document) => {
      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!document) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      Invitation.find({documentId: req.params.id})
      .populate("target", "-_id name email")
      .exec((err, users) => {

        var stakeholders = [];
        if(!err) {
          stakeholders = users.map(item => item.target)
        }

        return res.status(200).send({
          message: config.RES_MSG_DATA_FOUND,
          data: {
            _id: document._id,
            title: document.title,
            description: document.description,
            folder: document.folder,
            owner: document.owner,
            updatedAt: document.updatedAt,
            createdAt: document.createdAt,
            stakeholders,
          },
          status: config.RES_STATUS_SUCCESS,
        });
      })

    })
};


exports.recentlist = async (req, res) => {
  const { sortby, title, createdAt, version, page } = req.query;

  let sortobj = {};
  switch (sortby) {
    case 'title':
      sortobj = { title, createdAt, version };
      break;
    case 'createdAt':
      sortobj = { createdAt, title, version };
      break;
    case 'version':
      sortobj = { version, createdAt, title };
      break;
    default:
      break;
  }
  const documentIds = (await Invitation.find({ target: req.userId })).map(d => d.documentId)
  Document.find({
    $or: [
      { _id: { $in: documentIds } },
      { owner: req.userId }
    ]
  })
    .sort(sortobj)
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
            const completeVersion = await VersionFile.findOne({ document: (d._doc?._id || d._id), iscompleted: true });
            const lastVersion = await VersionFile.findOne({ document: (d._doc?._id || d._id) }).sort({ createdAt: -1 }).limit(1);
            return {
              ...(d._doc || d),
              count,
              completeVersion,
              lastVersion
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

exports.setToken = (req, res) => {
  Document.updateOne({ _id: req.params.id }, { token: req.body.token })
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

exports.stakeholders = async (req, res) => {
  const document_id = req.params.document_id;
  try {
    const authorIds = (await Invitation.find({ documentId: document_id }))?.map(d => d.target);
    // console.log(authorIds);
    // const users = await User.find();
    const users = await User.find({ _id: { $in: authorIds } });
    // console.log(users);
    return res.status(200).send({
      message: config.RES_MSG_DATA_FOUND,
      data: users,
      status: config.RES_STATUS_SUCCESS,
    });
  } catch (err) {
    return res.status(400).send({ message: err.message, status: "errors" });
  }
}

