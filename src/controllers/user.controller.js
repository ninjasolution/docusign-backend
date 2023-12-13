const { ethers } = require("ethers");
const { SUBADMIN, RES_STATUS_SUCCESS, PLATFORM_TYPE_STAKING_IDO, TX_TYPE_DEPOSIT, TX_TYPE_LOCK, RES_STATUS_FAIL, RES_MSG_DATA_NOT_FOUND, USER_STATUS_PENDING, USER_STATUS_APPROVE } = require("../config");
const { requestBotAPI } = require("../helpers");
const db = require("../models");
const { getRndInteger, getTier } = require("../service");
const { tiers } = require("../config/static.source");
const User = db.user;
const Role = db.role;
const Nonce = db.nonce;
const Transaction = db.transaction;
const axios = require("axios").default;
const bcrypt = require("bcryptjs");

exports.getInitialStatus = function(req,res ) {
  return res.send({ message: "Initial", status: RES_STATUS_SUCCESS });
}

exports.create = async (req, res) => {

  const user = new User(req.body);

  if (req.body.role) {
    Role.findOne({ name: req.body.role }, (err, role) => {
      if (err) {
        return res.status(200).send({ message: err, status: RES_STATUS_FAIL });
      }

      user.role = role._id;
      user.save(err => {
        if (err) {
          return res.status(200).send({ message: err, status: RES_STATUS_FAIL });
        }

        return res.status(200).send({ message: err, data: user, status: false });
      });
    }
    );
  } else {
    Role.findOne({ name: SUBADMIN }, (err, role) => {
      if (err) {
        return res.status(200).send({ message: "Role doesn't exist.", status: RES_STATUS_FAIL });

      }

      user.role = role._id;
      user.save(async (err, nUser) => {
        if (err) {
          return res.status(200).send({ message: `E11000 duplicate key error collection: users index: email_1 dup key: { email: ${req.body.email}}`, status: RES_STATUS_FAIL });

        }
        var token = jwt.sign({ id: rUser._id }, securityCode, {
          expiresIn: 86400 // 24 hours
        });
        nUser.token = token

        return res.status(200).send({
          message: RES_STATUS_SUCCESS,
          data: nUser,
          status: RES_STATUS_SUCCESS
        });
      });
    });
  }
};

exports.allUsers = (req, res) => {
  User.find()
    .populate('role', "name")
    .exec((err, users) => {

      if (err) {
        return res.status(200).send({ message: err });
      }

      if (!users) {
        return res.status(404).send({ message: "Orders Not found." });
      }

      return res.status(200).send(users);
    })
};

exports.getUser = (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate('role', "name")
    .exec((err, user) => {

      if (err) {
        return res.status(500).send({ message: err });
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found.", status: RES_STATUS_FAIL });
      }

      return res.status(200).send({ status: RES_STATUS_SUCCESS, data: user });
    })
};

exports.getUnApprovedAdmins = (req, res) => {

  Role.findOne({ name: SUBADMIN })
    .exec((err, role) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!role) {
        return res.status(404).send({ message: "Role Not found.", status: RES_STATUS_FAIL });
      }

      User.find({
        role: role?._id,
        status: {$ne: USER_STATUS_APPROVE}
      })
        .populate("projects")
        .exec((err, users) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          if (!users) {
            return res.status(404).send({ message: "Users Not found.", status: RES_STATUS_FAIL });
          }

          return res.status(200).send({ status: RES_STATUS_SUCCESS, data: users });
        })
    })
};

exports.getUserNonce = (req, res) => {
  Nonce.findOne({ wallet: req.params.address })
    .exec(async (err, nonce) => {

      if (err) {
        res.status(200).send({ message: err });
        return;
      }

      if (!nonce) {

        let _nonce = getRndInteger(10000, 1000000000)
        let newNonce = new Nonce({ wallet: req.params.address, nonce: _nonce })
        await newNonce.save();

        return res.status(200).json({ status: RES_STATUS_SUCCESS, data: { nonce: _nonce } });
      }

      return res.status(200).json({ status: RES_STATUS_SUCCESS, data: { nonce: nonce.nonce } });

    })
};

exports.setRole = (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate('role', "name")
    .exec((err, user) => {

      if (err) {
        res.status(200).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Orders Not found." });
      }

      Role
        .findOne({ name: req.params.role },
          (err, role) => {
            if (err) {
              return;
            }
            user.role = role._id;
            user.save(err => {
              if (err) {
                return;
              }
              User.findOne({ _id: user._id })
                .populate('role', "name")
                .exec((err, fUser) => {
                  if (err) {
                    res.status(200).send({ message: err });
                    return;
                  }

                  if (!fUser) {
                    return res.status(404).send({ message: "Orders Not found." });
                  }
                  return res.status(200).json(fUser);
                })
            });

          }
        );
    })
};

exports.update = (req, res) => {
  const { name, email, password, avatar, phone, countrycode, userId, bio, facebookLink, linkedInLink } = req.body;
  User.findOne({ _id: req.userId })
    .populate('role', "name")
    .exec(async (err, user) => {

      if (err) {
        res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found.", status: RES_STATUS_FAIL });
      }
      const saltRounds = 10;
      if(password && password?.length > 3) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
      }
      user.name = name;
      user.email = email;
      user.image = avatar;
      user.userId = userId;
      user.wallet = Math.random();
      user.bio = bio;
      user.facebookLink = facebookLink;
      user.linkedInLink = linkedInLink;
      if (avatar) {
        user.image = avatar;
      }
      user.phoneNumber = phone;
      user.countrycode = countrycode;
      user.save(err => {
        if (err) {
          return res.status(400).send({ message: err, status: RES_STATUS_FAIL });
        }
        return res.status(200).json({ status: RES_STATUS_SUCCESS, data: user });
      });
    })
};

exports.approve = (req, res) => {
  User.findOne({ _id: req.query?.userId })
    .exec(async (err, user) => {

      if (err) {
        res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found.", status: RES_STATUS_FAIL });
      }

      user.status = 1;

      user.save(err => {
        if (err) {
          return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        }
        return res.status(200).json({ status: RES_STATUS_SUCCESS, data: user });
      });
    })
};

exports.delete = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .exec(() => {
      res.status(200).send(RES_STATUS_SUCCESS);
    })
};



exports.dashboard = (req, res) => {

  try {
    Transaction
      .aggregate([{
        $match: { "user": req.userId, platform: PLATFORM_TYPE_STAKING_IDO, type: TX_TYPE_LOCK }
      },
      {
        $group: { _id: "$duration", amount: { $sum: '$amount' } }
      }
      ])
      .exec(async (err, deposits) => {

        if (err) {
          return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        }

        if (!deposits) {
          return res.status(404).send({ message: RES_MSG_DATA_NOT_FOUND, status: RES_STATUS_FAIL });
        }

        let tier = getTier(deposits.map(item => ({ duration: item._id, amount: item.amount })))
        let investment = 0;
        deposits.forEach(item => {
          investment += item.amount;
        })

        await User.updateOne({_id: req.userId}, {tier})

        return res.status(200).send({ data: { investment, tier }, status: RES_STATUS_SUCCESS });
      })
  } catch (err) {
    return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
  }

}

exports.checkVerification = (req, res) => {

  User.findOne({ _id: req.userId })
    .exec(async (err, user) => {

      if (err) {
        return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
      }

      if (!user) {
        return res.status(404).send({ message: err, status: RES_STATUS_FAIL });
      }

      try {

        return res.status(200).send({
          message: {
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified
          }, status: RES_STATUS_SUCCESS
        });
      } catch (err) {
        return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
      }

    })
}

exports.getpaymentinfo = (req, res) => {

  User.findOne({ _id: req.userId })
    .exec(async (err, user) => {

      if (err) {
        return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
      }

      if (!user) {
        return res.status(404).send({ message: err, status: RES_STATUS_FAIL });
      }

      const result = {
        evmAddress: user.evmAddress,
        btcAddress: user.btcAddress,
        paypalClientID: process.env.ADMIN_PAYPAL_CLIENT_ID,
        stripePublicKey: process.env.ADMIN_STRIPE_PUBLIC_KEY
      }
      return res.status(200).send({ data: result });

    })
}

exports.withdraw = (req, res) => {
  User.findOne({
    _id: req.userId
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: "Incorrect id or password", status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User doesn't exist", status: RES_STATUS_FAIL });
      }

      if (!user.withdrawAddress) {
        return res.status(400).send({ message: "Please put withdraw address", status: RES_STATUS_FAIL });
      }

      try {

        var data = JSON.stringify({
          userId: 2250,
          authCode: "1ee9394573062b6dbe275d9c570d52f4",
          amount: req.body.amount
        });

        await requestBotAPI("post", "withdrawal", data)


      } catch (error) {
        return res.status(500).send({ message: "The amount exceeds the total funds", status: RES_STATUS_FAIL });
      }

      try {

        new Transaction({
          user: user._id,
          type: "Withdraw",
          amount: req.body.amount,
          status: RES_STATUS_SUCCESS,
          paymentMethod: "Crypto"
        }).save(async (err, transaction) => {

          if (err) {
            console.log("error", err);
            return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
          }

          user.transactions.push(transaction);
          await user.save();
          return res.status(200).send({ message: `${req.body.amount} USDC is withdrawn to ${user.withdrawAddress}`, status: RES_STATUS_SUCCESS });

        });

      } catch (error) {
        return res.status(500).send({ message: error, status: RES_STATUS_FAIL });
      }
    })

}
