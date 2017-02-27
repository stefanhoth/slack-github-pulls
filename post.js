'use strict';

let request = require('request-promise');

module.exports = {
  json: do_json_post
}

function do_json_post(url, json) {

  var options = {
    uri: url,
    method: 'POST',
    body: json,
    json: true
  };

  return request(options);
}
