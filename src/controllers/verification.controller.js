const db = require("../models");
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const Docx = require('docx');
const Mammoth = require('mammoth');
const officegen = require('officegen')
let docx = officegen('docx');
const path = require('path');
const libreofficeConvert = require('libreoffice-convert');
const { PDFDocument } = require('pdf-lib');
const { Blob } = require('blob-util');
const FormData = require('form-data');
const axios = require("axios");

const Verification = db.verification;
const versionFile = db.versionFile
const config = require("../config/index");
const DocxMerger = require("docx-merger");

function rb64i(buffer) {
    const binData = Buffer.from(buffer);
    const bufferData = binData.toString('base64');
    const imgUrl = `data:image/png;base64,${bufferData}`;
    return imgUrl;
}


const cb64i = (src) => {
    // Split the src to separate the MIME type and base64 data
    const [mime, base64Data] = src.split(';base64,');
    console.log('^-^Mime : ', mime);
    // console.log('^-^Base64 : ', base64Data.substring(0, 20));
    return Buffer.from(base64Data, 'base64');
}

// async function convertToPdf(inputFile, outputFilePath) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const ext = 'pdf';
//       const docxBuf = await fs.promises.readFile(inputFile, 'binary');
//       // const zip = new PizZip(docxBuf);
//       // const doc = new Docxtemplater();
//       // doc.loadZip(zip);
//       // doc.setData();
//       // doc.render();
//       // const buf = doc.getZip().generate({ type: 'nodebuffer' });
//       convert(Buffer.from(docxBuf), ext, undefined, async (err, result) => {
//         if(err) {
//           reject(err)
//         } else {
//           await fs.promises.writeFile(outputFilePath, result);
//           resolve()
//         }
//       });
//     } catch (error) {
//       reject(error)
//     }
//   });
// }

async function convertToPdf(inputFile, outputFilePath) {
    return new Promise((resolve, reject) => {
        libreofficeConvert.convert(inputFile, '.pdf', undefined, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

const createUserSignPanel = (d) => {
    try {
        const arr = [];
        if (d?._doc?.userId?._doc || d?.userId) {
            let user = (d?._doc?.userId?._doc || d?.userId)
            let userId = user?.userId || "";
            let name = user?.name || "";
            let email = user?.email || ""
            // insert user info
            // arr.push(new Docx.Paragraph({
            //   children: [
            //     new Docx.ImageRun({
            //       data: fs.readFileSync(`public/files/${user?.image}`),
            //       transformation: {
            //         width: 60, height: 60,
            //       },
            //       altText: {
            //         title: "No Avatar Image",
            //         description: "No Avatar Image",
            //         name: "No Avatar Image"
            //       }
            //     })
            //   ]
            // }))
            arr.push(new Docx.TextRun({
                text: `UserId: ${userId || ""}`
            }))
            arr.push(
                new Docx.TextRun({
                    text: `Name: ${name || ""}`
                })
            )
            arr.push(
                new Docx.TextRun({
                    text: `Email: ${email || ""}`
                })
            )

            // // add capture
            if (d?._doc?.capture || d?.capture) {
                arr.push(
                    new Docx.ImageRun({
                        data: (d?._doc?.capture || d?.capture),
                        transformation: {
                            width: 200,
                            height: 200
                        },
                        altText: {
                            title: "No Picture",
                            description: "No Picture",
                            name: "No Picture"
                        }
                    })
                )
            }

            // // // add capture
            if (d?._doc?.signature || d?.signature) {
                arr.push(
                    new Docx.ImageRun({
                        data: (d?._doc?.signature || d?.signature),
                        transformation: {
                            width: 200,
                            height: 200
                        },
                        altText: {
                            title: "No Signature",
                            description: "No Signature",
                            name: "No Signature"
                        }
                    })
                )
            }

        }
        return arr
    } catch (error) {
        return [new Docx.TextRun({
            text: "Error occured while generating docx."
        })]
    }
}

const createSignDoc = (id) => {
    return new Promise((resolve, reject) => {
        Verification.find({ version: id })
            .populate('userId')
            .populate('version')
            .sort({ createdAt: -1 })
            .exec(async (err, verifications) => {
                if (err) {
                    reject(error);
                }
                try {
                    const updatedVerifications = await Promise.all(verifications.map(async d => {
                        let capture;
                        let signature;
                        if (d?._doc?.capture || d?.capture) {
                            capture = rb64i(d?._doc?.capture || d?.capture)
                        }
                        if (d?._doc?.signature || d?.signature) {
                            signature = rb64i(d?._doc?.signature || d?.signature)
                        }
                        return {
                            ...(d._doc || d),
                            capture,
                            signature
                        }
                    }))
                    const versionData = await versionFile.findOne({ _id: id });
                    // Read version doc file
                    const dom = updatedVerifications?.map(d => {
                        return createUserSignPanel(d)
                    });

                    let domArray = [];
                    dom.map(subdom => {
                        subdom.map(subd => { domArray.push(subd) })
                    })
                    // create doc with signatures and captures users made
                    const document = new Docx.Document({
                        sections: [
                            {
                                properties: {},
                                children: [
                                    new Docx.Paragraph({
                                        text: "User Lists",
                                        pageBreakBefore: true,
                                        alignment: Docx.AlignmentType.CENTER,
                                        heading: Docx.HeadingLevel.HEADING_1
                                    }),
                                    ...domArray.map(d =>
                                        new Docx.Paragraph({
                                            children: [
                                                d
                                            ]
                                        }),
                                    )
                                ]
                            }
                        ]
                    });
                    const versionSignDocName = `version_sign_${id}.docx`;
                    const fileName = `version_${id}_signs.pdf`;
                    const buffer = await Docx.Packer.toBuffer(document)
                    fs.writeFileSync(`public/files/${versionSignDocName}`, buffer);
                    // generate buffer from document

                    // combine word with officegen
                    // const firstDocx = fs.readFileSync(`${versionData?.fileName}`);
                    const resFile1 = await axios.get(`${versionData?.fileName}`, {
                        responseType: 'arraybuffer' // Set the responseType to 'arraybuffer'
                      });
                    const firstDocx = resFile1.data;
                    // console.log('^^^ipfs versionDoc:',firstDocx)
                    const secondDocx = fs.readFileSync(`public/files/${versionSignDocName}`);

                    const pdfBuffer1 = await convertToPdf(Buffer.from(firstDocx), '');
                    const pdfBuffer2 = await convertToPdf(Buffer.from(secondDocx), '');

                    const pdf1 = await PDFDocument.load(pdfBuffer1);
                    const pdf2 = await PDFDocument.load(pdfBuffer2);

                    const mergedPdf = await PDFDocument.create();


                    // Iterate over pages from the first document and add them to the merged document
                    const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
                    pages1.forEach((page) => mergedPdf.addPage(page));

                    // Iterate over pages from the second document and add them to the merged document
                    const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
                    pages2.forEach((page) => mergedPdf.addPage(page));

                    // Save the merged document as a new PDF file
                    const mergedPdfBytes = await mergedPdf.save();
                    fs.writeFileSync(`public/files/${fileName}`, mergedPdfBytes);
                    const pdfbuffer = await fs.promises.readFile(`public/files/${fileName}`);
                    var formdata = new FormData();

                    formdata.append('outputpath', pdfbuffer);
                    formdata.append('file', pdfbuffer, fileName);
                    
                    const resFile = await axios({
                      method: "post",
                      url: process.env.IPFS_PATH,
                      data: formdata,
                      headers: {
                        'pinata_api_key': `${process.env.PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.PINATA_API_SECRET}`,
                        "Content-Type": "multipart/form-data"
                      },
                    });
                    // console.log('^-^-^-^', resFile);
                    const ipfsURL = process.env.IPFS_CLOUD + resFile.data.IpfsHash;
                    console.log('^-^-^-^', ipfsURL);
                

                    await versionFile.findByIdAndUpdate(id, { verifyDoc: ipfsURL });
                    resolve(true);
                } catch (error) {
                    console.log("error", error);
                    reject(error);
                }
            })
    })
}

exports.list = (req, res) => {
    const version_id = req.params.version_id;
    // console.log('%^^', version_id)
    Verification.find({ version: version_id })
        .populate('userId')
        .sort({ createdAt: -1 })
        .exec(async (err, verifications) => {
            if (err) {
                res.status(500).send({ message: err, status: config.RES_STATUS_FAIL });
                return;
            }

            try {
                const updatedVerifications = await Promise.all(verifications.map(async d => {
                    let capture;
                    let signature;
                    if (d?._doc?.capture || d?.capture) {
                        capture = rb64i(d?._doc?.capture || d?.capture)
                    }
                    if (d?._doc?.signature || d?.signature) {
                        signature = rb64i(d?._doc?.signature || d?.signature)
                    }

                    return {
                        ...(d._doc || d),
                        capture,
                        signature
                    }
                }))

                return res.status(200).send({
                    message: config.RES_MSG_DATA_FOUND,
                    data: updatedVerifications,
                    status: config.RES_STATUS_SUCCESS,
                });
            } catch (error) {
                return res.status(400).send({
                    message: config.RES_MSG_DATA_NOT_FOUND,
                    data: [],
                    status: config.RES_STATUS_FAIL,
                });

            }

        })
};

exports.genword = async (req, res) => {
    const version_id = req.params.version_id;
    console.log('%^^', version_id)
    try {
        let version = await versionFile.findById(version_id);
        if (version?.verifyDoc) {
            return res.status(200).send({
                message: config.RES_MSG_DATA_FOUND,
                data: {
                    fileName: version?.verifyDoc
                },
                status: config.RES_STATUS_SUCCESS,
            });
        } else {
            try {
                // check user signed or not
                let verifications = await Verification.count({ version: version_id });
                if (verifications > 0) {
                    try {
                        await createSignDoc(version_id);
                        version = await versionFile.findById(version_id);
                        // console.log(version)
                        if (version?.verifyDoc) {
                            return res.status(200).send({
                                message: config.RES_MSG_DATA_FOUND,
                                data: {
                                    fileName: version?.verifyDoc
                                },
                                status: config.RES_STATUS_SUCCESS,
                            });
                        } else {
                            console.log("Error occured here")
                            return res.status(400).send({
                                message: config.RES_MSG_DATA_NOT_FOUND,
                                data: [],
                                status: config.RES_STATUS_FAIL,
                            });
                        }
                    } catch (error) {
                        console.log("***", error);
                        return res.status(400).send({
                            message: config.RES_MSG_DATA_NOT_FOUND,
                            data: [],
                            status: config.RES_STATUS_FAIL,
                        });
                    }
                } else {
                    console.log("***", "verifications");
                    return res.status(400).send({
                        message: config.RES_MSG_DATA_NOT_FOUND,
                        data: [],
                        status: config.RES_STATUS_FAIL,
                    });
                }
            } catch (error) {
                console.log(error);
                return res.status(400).send({
                    message: config.RES_MSG_DATA_NOT_FOUND,
                    data: [],
                    status: config.RES_STATUS_FAIL,
                });
            }
        }
    } catch (error) {
        return res.status(400).send({
            message: config.RES_MSG_DATA_NOT_FOUND,
            data: [],
            status: config.RES_STATUS_FAIL,
        });
    }
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


exports.create = async (req, res) => {
    // console.log('^^', req.body);
    let { capture, signature } = req.body;
    if (capture) capture = cb64i(capture);
    if (signature) signature = cb64i(signature);
    try {
        // find version and check it was completed or not
        const version = await versionFile.findById(req.body.version_id);
        if (version) {
            if (version?.iscompleted) {
                // check already you made signature or not
                let verify = await Verification.findOne({
                    version: version?._id,
                    userId: req.userId
                });
                if (verify) {
                    if (capture) {
                        if (!verify?.capture) {
                            await Verification.findByIdAndUpdate(verify?._id, {
                                capture
                            });
                        } else {
                            return res.status(200).send({ message: config.RES_MSG_UPDATE_FAIL, status: config.RES_STATUS_EXIST });
                        }
                    } else if (signature) {
                        if (!verify?.signature) {
                            await Verification.findByIdAndUpdate(verify?._id, {
                                signature
                            });
                        } else {
                            return res.status(200).send({ message: config.RES_MSG_UPDATE_FAIL, status: config.RES_STATUS_EXIST });
                        }
                    } else {
                        return res.status(400).send({ message: "Something went wrong", status: config.RES_STATUS_FAIL });
                    }
                    try {
                        await createSignDoc(version?._id);
                    } catch (error) {
                        console.log(error);
                    }

                    const data = await Verification.findById(verify?._id);
                    return res.status(200).send({
                        message: config.RES_MSG_SAVE_SUCCESS,
                        data,
                        status: config.RES_STATUS_SUCCESS,
                    });
                } else {
                    const verification = new Verification({
                        version: req.body.version_id,
                        capture: capture,
                        signature: signature,
                        userId: req.userId
                    });
                    await verification.save();
                    try {
                        await createSignDoc(req.body.version_id);
                    } catch (error) {
                        console.log(error);
                    }
                    const data = await Verification.findById(verification?._id);
                    return res.status(200).send({
                        message: config.RES_MSG_SAVE_SUCCESS,
                        data,
                        status: config.RES_STATUS_SUCCESS,
                    });
                }
            } else {
                return res.status(200).send({
                    message: "This version is not completed",
                    status: config.RES_STATUS_FAIL,
                });
            }
        } else {
            return res.status(200).send({
                message: config.RES_MSG_DATA_NOT_FOUND,
                status: config.RES_STATUS_FAIL,
            });
        }
    } catch (error) {
        console.log(err)
        return res.status(400).send({ message: err.message, status: config.RES_STATUS_FAIL });
    }
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

