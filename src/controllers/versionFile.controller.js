const db = require("../models");
const VersionFile = db.versionFile;
const Verification = db.verification;
const config = require("../config/index")

exports.list = (req, res) => {
  const document_id = req.params.document_id;
  const { sortby, title, createdAt, version, page, keyword } = req.query;
  console.log('^^^ api versions req.query:', req.query);
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
  VersionFile.find({ document: document_id })
    .populate('userId')
    .sort(sortobj)
    .exec(async (err, versionFiles) => {
      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      const updatedDocs = await Promise.all(versionFiles.map(async d => {
        // find verification info
        let verify;
        if(d?._doc?.iscompleted || d?.iscompleted) {
          verify = await Verification.findOne({ version: (d?._doc?._id || d?._id), userId: req.userId })
        }
        return {
          ...(d?._doc || d),
          verify
        }
      }))

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: updatedDocs,
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
  // console.log('^^', req.body);
  const versionFile = new VersionFile({
    document: req.body.document_id,
    ...req.body,
    fileName: res.locals.fileName,
    userId: req.userId
  });
  versionFile.save(async (err, version) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    let newversion = await VersionFile.findOne({ _id: version._id}).populate('userId');
    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: newversion,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.update = (req, res) => {
  VersionFile.updateOne({ _id: req.params.id }, { title: req.body.title })
    .exec(async (err, versionFile) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      const newviersionFile = await VersionFile.findOne({ _id: req.params.id }).populate('userId');

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: newviersionFile,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  VersionFile.deleteOne({ 
    _id: req.params.id,
    userId: req.userId
  })
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


exports.docomplete = (req, res) => {
  VersionFile.updateOne({ _id: req.params.id }, { iscompleted: true })
    .exec(async (err, versionFile) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }
      const newviersionFile = await VersionFile.findOne({ _id: req.params.id }).populate('userId');
      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: newviersionFile,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};
