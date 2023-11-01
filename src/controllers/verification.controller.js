const db = require("../models");
const Verification = db.verification;
const config = require("../config/index")

exports.list = (req, res) => {
  const version_id = req.params.version_id;
  // console.log('%^^', version_id)
  Verification.find({ version: version_id })
    .populate('userId')
    .sort({ createdAt: -1 })
    .exec((err, verifications) => {
      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: verifications,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.getById = (req, res) => {
  const id = req.params.id;
  Verification.findOne({ _id: id })
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


const cb64i = (src) => {
  // Split the src to separate the MIME type and base64 data
  const [mime, base64Data] = src.split(';base64,');
  console.log('^-^Mime : ', mime);
  console.log('^-^Base64 : ', base64Data.substring(0, 20));
  return Buffer.from(base64Data, 'base64');
}

exports.create = (req, res) => {
  console.log('^^', req.body);
  let { capture, signature } = req.body;
  capture = cb64i(capture);
  signature = cb64i(signature);
  const verification = new Verification({
    version: req.body.version_id,
    capture: capture,
    signature: signature,
    userId: req.userId
  });
  verification.save(async (err, verifies) => {
    if (err) {
      console.log(err)
      return res.status(400).send({ message: err, status: "errors" });
    }

    let newverifies = await Verification.findOne({ _id: verifies._id}).populate('userId');
    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: newverifies,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}


exports.update = (req, res) => {
  console.log('^^', req.body);
  let { capture, signature } = req.body;
  capture = cb64i(capture);
  signature = cb64i(signature);
  Verification.updateOne(
    { _id: req.params.id }, 
    { name: req.body.name }
    )
    .exec((err, Verification) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Verification,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Verification.deleteOne({ _id: req.params.id })
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

