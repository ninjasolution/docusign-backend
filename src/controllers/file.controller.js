
const fs = require('fs');
const path = require('path')
const multer = require('multer');

exports.create = (req, res) => {

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
      fs.rename('./public/files/' + req.file.originalname, './public/files/' + fileName, function (err) {
        if (err) console.log('ERROR: ' + err);
      });
    // }, 1000);
    return res.send({
      fileName: fileName
    });
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

