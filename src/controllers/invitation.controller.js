const db = require("../models");
const Invitation = db.invitation;
const User = db.user;
const config = require("../config/index")

exports.list = (req, res) => {
  Invitation.find({ owner: req.userId })
    .exec((err, invitations) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      if (!invitations) {
        return res.status(404).send({ message: config.RES_MSG_DATA_NOT_FOUND });
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: invitations,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.counttotallist = async (req, res) => {
  // receive
  try {
    let friends = [];
    let receiveInviteUsers = (await Invitation.find({
      target: req.userId
    })).map(d => d.owner)
    // send
    let sendInviteUsers = (await Invitation.find({
      owner: req.userId
    })).map(d => d.target);
    friends = [...receiveInviteUsers, ...sendInviteUsers];
    const count = await User.count({ _id: { $in: friends } });
    return res.status(200).send({
      message: config.RES_MSG_DATA_FOUND,
      data: count,
      status: config.RES_STATUS_SUCCESS,
    });
  } catch (error) {
    res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
  }
};

exports.totallist = async (req, res) => {
  // receive
  try {
    let friendIds = [];
    let receiveInviteUsers = (await Invitation.find({
      target: req.userId
    })).map(d => d.owner)
    // send
    let sendInviteUsers = (await Invitation.find({
      owner: req.userId
    })).map(d => d.target);
    friendIds = [...receiveInviteUsers, ...sendInviteUsers];
    // console.log('^^^', friendIds);
    const friends = await User.find({ _id: { $in: friendIds } });
    // console.log('^^^', friends.length);
    return res.status(200).send({
      message: config.RES_MSG_DATA_FOUND,
      data: friends,
      status: config.RES_STATUS_SUCCESS,
    });
  } catch (error) {
    res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
  }
};

exports.notificationlist = (req, res) => {
  Invitation.find({ 
    
    target: req.userId,
    permision: true,
    isAccepted: false
  })
    .populate('owner')
    .populate('documentId')
    .limit(5)
    .exec((err, invitations) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_DATA_FOUND,
        data: invitations,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};

exports.create = async (req, res) => {
  const user = await User.findOne({ email: req.body.username });
  if(user) {
    const existinvitation = await Invitation.findOne({
      owner: req.userId,
      target: user.id,
      permision: true,
      documentId: req.body.documentId
    });
    if(existinvitation) {
      return res.status(200).send({
        message: config.RES_MSG_SAVE_FAIL,
        data: config.RES_MSG_SAVE_FAIL,
        status: config.RES_STATUS_EXIST,
      });
    } else {
      const invitation = new Invitation({
        ...req.body,
        owner: req.userId,
        target: user.id,
        permision: true,
      });
      invitation.save(async (err, result) => {
        if (err) {
          console.log(err)
          return res.status(400).send({ message: err, status: "errors" });
        }
    
        return res.status(200).send({
          message: config.RES_MSG_SAVE_SUCCESS,
          data: result,
          status: config.RES_STATUS_SUCCESS,
        });
      });
    }
  } else {
    return res.status(200).send({
      message: config.RES_MSG_SAVE_FAIL,
      data: config.RES_MSG_SAVE_FAIL,
      status: config.RES_STATUS_FAIL,
    });
  }
}


exports.update = (req, res) => {
  Invitation.updateOne({ _id: req.params.id }, { name: req.body.name })
    .exec((err, Invitation) => {

      if (err) {
        res.status(500).send({ message: err, status: config.RES_MSG_UPDATE_FAIL });
        return;
      }

      return res.status(200).send({
        message: config.RES_MSG_UPDATE_SUCCESS,
        data: Invitation,
        status: config.RES_STATUS_SUCCESS,
      });
    })
};


exports.delete = (req, res) => {
  Invitation.deleteOne({ _id: req.params.id })
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

exports.getById = (req, res) => {
  Invitation.findOne({ _id: req.params.id })
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

