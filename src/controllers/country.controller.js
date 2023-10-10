const db = require("../models");
const Country = db.country;
const config = require("../config/index")

exports.create = (req, res) => {
  const country = new Country({
    name: req.body.name,
    code: req.body.code,
    timezone: req.body.timezone,
    utc: req.body.utc,
    mobileCode: req.body.mobileCode,
  })

  country.save(async (err, _country) => {
    if (err) {
      return res.status(400).send({ message: err, status: config.RES_STATUS_FAIL });
    }

    return res.status(200).send({
      message: config.RES_MSG_SAVE_SUCCESS,
      data: _country,
      status: config.RES_STATUS_SUCCESS,
    });
  });
}

exports.list = (req, res) => {
  Country.find()
    .exec((err, countries) => {

      if (err) {
        return res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
      }

      if (!countries) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: countries,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.update = (req, res) => {
  Country.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, country) => {

      if (err) {
        return res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: country,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Country.deleteOne({ _id: req.params.id })
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
