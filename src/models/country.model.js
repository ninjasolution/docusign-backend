const mongoose = require("mongoose");


module.exports = (connection, autoIncrement) => {

  const CountrySchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true
    },
    code: {
      type: String,
      unique: true
    },
    timezone: {
      type: String
    },
    utc: {
      type: String
    },
    mobileCode: {
      type: String
    },
  });
  CountrySchema.plugin(autoIncrement.plugin, "Country")

  const Country = connection.model(
    "Country",
    CountrySchema
  );
  return Country;
}
