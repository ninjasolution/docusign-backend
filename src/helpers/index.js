const axios = require('axios').default;

exports.requestBotAPI = async (method, url, data) => {

  var config = {
    method,
    url: `${process.env.BOT_API}/api/${url}`,
    headers: {
        'Content-Type': 'application/json'
    },
    data
  };
  return await axios(config);

}

