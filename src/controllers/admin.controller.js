const db = require("../models");

exports.drop = async (req, res) => {
  try {
    await db.connection.dropDatabase();  
    return res.status(200).send({ message: "Success." });
  }catch (error) {
    return res.status(200).send({ message: error, status: "errors" });
  }
};


