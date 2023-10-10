const db = require("../models");
const config = require("../config/index");
const { getTier } = require("../service");
const Transaction = db.transaction;
const User = db.user;

exports.create = async (req, res) => {

  try {
    const transaction = new Transaction({
      type: req.body.type,
      platform: req.body.platform,
      project: req.body.project,
      amount: req.body.amount,
      coin: req.body.coin,
      paymentMethod: req.body.paymentMethod,
      chainId: req.body.chainId,
      status: req.body.status,
      duration: req.body.duration,
      hash: req.body.hash,
      user: req.userId,
    })

    let transactions = await Transaction
      .aggregate([{
        $match: { "user": req.userId, platform: config.PLATFORM_TYPE_STAKING_IDO, type: config.TX_TYPE_LOCK }
      },
      {
        $group: { _id: "$duration", amount: { $sum: '$amount' } }
      }
      ]).exec()



    let tier = getTier(transactions.map(item => ({ duration: item._id, amount: item.amount })))
    let investment = 0;
    transactions.forEach(item => {
      investment += item.amount;
    })

    await User.updateOne({ _id: req.userId }, { tier })

    transaction.save(async (err, _transaction) => {
      if (err) {
        console.log(err)
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }


      return res.status(200).send({
        message: config.RES_MSG_SAVE_SUCCESS,
        data: _transaction,
        status: config.RES_STATUS_SUCCESS,
      });
    });
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      message: config.RES_MSG_SAVE_FAIL,
      status: config.RES_STATUS_FAIL,
    });
  }
}

exports.list = (req, res) => {

  let options = {}
  if (req.query.type) {
    options.type = req.query.type
  }

  Transaction.find()
    .exec((err, projects) => {

      if (err) {
        return res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
      }

      if (!projects) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: projects,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.update = (req, res) => {
  Transaction.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Transaction) => {

      if (err) {
        return res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Transaction,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Transaction.deleteOne({ _id: req.params.id })
    .exec((err) => {

      if (err) {
        return res.status(500).send({ message: err, status: config.RES_MSG_DELETE_FAIL });
      }
      return res.status(200).send({
        message: config.RES_MSG_DELETE_SUCCESS,
        status: config.RES_STATUS_SUCCESS,
      });

    })
};
