
const fs = require('fs');
const path = require('path')
const multer = require('multer');
const axios = require("axios");
const FormData = require('form-data');

exports.create = async (req, res) => {
  try {
    
    if (!req.file) {
      return res.send({
        success: false
      });
  
    } else {
      // console.log('req.file:', req.file);
      const words = req.file.originalname.split('.');
      const fileType = words[words.length - 1];
      const fileName = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}-${new Date().getMilliseconds()}.${fileType}`;
      var outputPath = './public/files/';
      // setTimeout(() => {
        await fs.rename(outputPath + req.file.originalname, outputPath + fileName, function (err) {
          if (err) console.log('ERROR: ' + err);
        });
      // }, 1000);
  
      const filebuffer = await fs.promises.readFile(`public/files/${fileName}`);
      // const filebuffer = Buffer.from(req.file.data);
      var formdata = new FormData();
  
      formdata.append('outputpath', filebuffer);
      formdata.append('file', filebuffer, fileName);
      
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
      const ipfsURL = process.env.IPFS_CLOUD + resFile.data.IpfsHash;
  
      return res.send({
        fileName: ipfsURL
      });
    }
  } catch (error) {
    console.log("profile image update error:", error);
    return res.send({
      success: false,
      message: error.toString()
    });

  }
}

exports.versioncreate = async (req, res, next) => {
  if (!req.file) {
    console.log("No file is available!");
    return res.send({
      success: false
    });

  } else {
    const words = req.file.originalname.split('.');
    const fileType = words[words.length - 1];
    const fileName = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}-${new Date().getMilliseconds()}.${fileType}`;

    // setTimeout(() => {
      await fs.rename('./public/files/' + req.file.originalname, './public/files/' + fileName, function (err) {
        if (err) console.log('version file upload ERROR: ' + err);
      });
    // }, 1000);
    const filebuffer = await fs.promises.readFile(`public/files/${fileName}`);
    var formdata = new FormData();

    formdata.append('outputpath', filebuffer);
    formdata.append('file', filebuffer, fileName);
    
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
    console.log('^-^-^-^fileupload:', ipfsURL);

    // Store file name in res.locals
    res.locals.fileName = ipfsURL;
    
    next();
  }
}


exports.get = (req, res) => {

  var url = path.join(__dirname, './public/files/')
  res.sendFile(`${url}/${req.params.fileName}`);
}

exports.delete = (req, res) => {
  fs.unlink(`./public/files/${req.params.fileName}`, (err) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send('success');
  })
}


const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, './public/files');
  },
  filename: (req, file, cb) => {

    cb(null, file.originalname);
  }
});

exports.upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 10 } });

