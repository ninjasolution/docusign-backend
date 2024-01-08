const db = require("../models");
const VersionFile = db.versionFile;
const Verification = db.verification;
const Users = db.user
const config = require("../config/index");
const { cond } = require("lodash");

exports.list = (req, res) => {
  const document_id = req.params.document_id;
  const { sortby, title, createdAt, version, editor, page, keyword } = req.query;
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
  let condition = editor < 0 ?
    { document: document_id } :
    { document: document_id, userId: editor };
  // console.log('^^^condition: ', condition);
  VersionFile.find(condition)
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
        if (d?._doc?.iscompleted || d?.iscompleted) {
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

exports.getEditors = async (req, res) => {
  const document_id = req.params.document_id;
  console.log("document_id", document_id);
  try {
    let userIds = await VersionFile.aggregate([
      {
        $match: {
          document: Number(document_id)
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId"
          },
          userId: {
            $first: "$userId"
          }
        }
      },
      {
        $project: {
          _id: 0,
          userId: 1
        }
      }
    ]).exec();
    console.log(userIds);
    userIds = userIds.map(d => d?.userId);
    const users = await Users.find({ _id: { $in: userIds } });
    return res.status(200).send({
      message: config.RES_MSG_DATA_FOUND,
      data: users,
      status: config.RES_STATUS_SUCCESS,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error?.message, status: config.RES_STATUS_FAIL });
  }
}

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


exports.create = async (req, res) => {
  console.log('^^', req.body, Number.parseFloat(req.body.versoin));
  try {
    const versionFile = new VersionFile({
      document: req.body.document_id,
      ...req.body,
      fileName: res.locals.fileName,
      userId: req.userId,
      isselected: true,
      iscompleted: false
    });
    let vMm = req.body.versoin;
    const _version = await VersionFile.findOne({
      document: req.body.document_id,
    }).sort({ createdAt: -1 }).limit(1);
    if (_version) {
      if (vMm && Number.parseFloat(vMm) > Number.parseFloat(_version?.version)) {
        versionFile.version = Number.parseFloat(vMm).toFixed(1);
      } else {
        versionFile.version = (Number.parseFloat(_version?.version) + 0.1).toFixed(1)
      }
    } else {
      versionFile.version = Number.parseFloat(vMm).toFixed(1) || 1.0
    }
    versionFile.save(async (err, version) => {
      if (err) {
        console.log(err)
        return res.status(400).send({ message: err, status: "errors" });
      }
      await VersionFile.updateMany({
        document: req.body.document_id,
        _id: { $ne: version._id }
      },
        {
          isselected: false
        });
      let newversion = await VersionFile.findOne({ _id: version._id }).populate('userId');
      return res.status(200).send({
        message: config.RES_MSG_SAVE_SUCCESS,
        data: newversion,
        status: config.RES_STATUS_SUCCESS,
      });
    });
  } catch (error) {
    return res.status(500).send({
      message: config.RES_MSG_SAVE_FAIL,
      data: newversion,
      status: config.RES_STATUS_FAIL,
    });
  }
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

exports.doselect = (req, res) => {
  try {
    VersionFile.updateOne({ _id: req.params.id }, { isselected: true })
      .exec(async (err, result) => {

        if (err) {
          res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
          return;
        }

        const versionFile = await VersionFile.findById(req.params.id);

        console.log(versionFile.document)
        console.log("Number of matched documents:",
          await VersionFile.count({ document: versionFile.document, _id: { $ne: versionFile._id } })
        );
        await VersionFile.updateMany({
          document: versionFile.document,
          _id: { $ne: versionFile._id }
        },
          {
            isselected: false
          });
        console.log("Number of modified documents:",
          await VersionFile.count({ document: versionFile.document, isselected: false })
        );
        const newviersionFile = await VersionFile.findOne({ _id: req.params.id }).populate('userId');
        return res.status(200).send({
          message: config.RES_MSG_UPDATE_SUCCESS,
          data: newviersionFile,
          status: config.RES_STATUS_SUCCESS,
        });
      })
  } catch (error) {
    return res.status(200).send({
      message: config.RES_MSG_UPDATE_FAIL,
      data: newviersionFile,
      status: config.RES_STATUS_FAIL,
    });
  }
};
