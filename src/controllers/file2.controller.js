const fs = require('fs');
const path = require('path')
const multer = require('multer');
const uuid = require('uuid');
const db = require("../models");
const csv = require("csv-parser");
const { RES_STATUS_FAIL, RES_STATUS_SUCCESS, PROJECT_STATUS_FILEHASH, PROJECT_STATUS_SNAPSHOT, RES_MSG_SAVE_SUCCESS, RES_MSG_SAVE_FAIL, PERCENT_DIVISOR, PROJECT_STATUS_WHITELIST } = require('../config');
const { tiers } = require('../config/static.source');
const { generateAllocLeaves, generateMerkleRootAndProof } = require('../service');
const { ethers } = require('ethers');
const service = require('../service');
const User = db.user;
const Project = db.project;
const WhiteList = db.whiteList;
const Transaction = db.transaction;

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './files');
    },
    filename: (req, file, cb) => {

        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

exports.uploadCVS = upload.single('csv');
exports.uploadAvatar = upload.single('avatar');

exports.csvUploader = (req, res) => {
    User.findOne({ _id: req.userId })
        .populate('role', "name")
        .exec(async (err, user) => {

            if (err) {
                res.status(500).send({ message: err, status: RES_STATUS_FAIL });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: err, status: RES_STATUS_FAIL });
            }

            if (!req.file) {
                console.log("No file is available!");
                return res.send({
                    success: false
                });

            } else {

                const words = req.file.originalname.split('.');
                const fileType = words[words.length - 1];
                const fileName = uuid.v1() + "." + fileType;
                var whiteLists = [];

                Project.findOne({ _id: req.body.projectId })
                    .populate("curTag")
                    .exec(async (err, project) => {
                        if (err) {
                            return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
                        }

                        if (!project) {
                            return res.status(404).send({ message: err, status: RES_STATUS_FAIL });
                        }

                        project.csv = fileName;
                        project.status = PROJECT_STATUS_WHITELIST;

                        fs.createReadStream(`./files/${req.file.originalname}`)
                            .pipe(csv())
                            .on('data', async (row) => {

                                whiteLists.push({
                                    address: row.address,
                                    percent: row.percent,
                                    project: project._id
                                })
                            })
                            .on('end', () => {
                                console.log('CSV file successfully processed');

                                User.find({ wallet: { $nin: whiteLists.map(item => item.address) } })
                                    .exec(async (err, users) => {

                                        if (err) {
                                            return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
                                        }

                                        if (users) {

                                            for (let i = 0; i < users.length; i++) {
                                                if (users[i].tier) {
                                                    whiteLists.push({ address: users[i].address, percent: user.tier.percent, project: project._id })
                                                }
                                            }

                                            let allocations = whiteLists.map(item => ({
                                                tagId: project.curTag.title,
                                                account: item.address,
                                                maxAllocation: service.customParse((project.token.totalSupply * item.percent / 100), 4),
                                                refundFee: "40",
                                                igoTokenPerPaymentToken: project.curTag.price,
                                            }));

                                            let leaves = generateAllocLeaves(allocations)
                                            let { root, proofs } = generateMerkleRootAndProof(leaves);

                                            let newList = [];
                                            let count = whiteLists.length;
                                            for (let i = 0; i < count; i++) {
                                                newList.push({
                                                    ...whiteLists[i],
                                                    proof: proofs[i]
                                                })
                                            }

                                            await WhiteList.insertMany(newList);
                                            project.rootHash = root;
                                            await project.save();

                                            return res.status(200).send({ status: RES_STATUS_SUCCESS, data: RES_MSG_SAVE_SUCCESS });
                                        } else {
                                            return res.status(4004).send({ status: RES_STATUS_FAIL, data: RES_MSG_SAVE_SUCCESS });
                                        }

                                    })
                            });

                    })

            }

        })

}

exports.getWhiteList = (req, res) => {
    var rows = [];
    fs.createReadStream(`./src/files/csv/${req.query.projectId}`)
        .pipe(csv())
        .on('data', async (row) => {

            rows.push({
                address: row.address,
                percent: row.percent
            })
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            return res.status(200).send({ status: RES_STATUS_SUCCESS, data: rows });
        });
}

exports.getFile = (req, res) => {

    var url = path.join(__dirname, '../../files/')
    res.sendFile(`${url}/${req.params.fileName}`);
}

exports.delete = (req, res) => {
    fs.unlink(`./files/${req.params.fileName}`, (err) => {
        if (err) return res.status(200).send(err);
        return res.status(200).send('success');
    })
}


