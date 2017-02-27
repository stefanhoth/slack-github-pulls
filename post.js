'use strict';

let request = require('request-promise');

module.exports = {
  json: (url, json) => {
    do_json_post(url, json)
  }
}

function do_json_post(url, json) {

  console.log("url=", url);
  console.log("json=", json);

  var options = {
    uri: url,
    method: 'POST',
    body: json,
    json: true
  };

  return request(options);
}
