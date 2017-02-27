'use strict';

const qs = require('querystring');
const timeago = require("timeago.js");

const poster = require('./post.js');

let response_url = null;

module.exports = {
  digestPush: digestPush,
  sendError: (err) => {
    sendError(err)
  },
  sendSuccess: (message) => {
    sendSuccess(message)
  },
  goodJSON: (text) => {
    return buildGoodResponse(text);
  }
}

function digestPush(event, callback) {

  if (!event) {
    callback("Body was empty. Aborting parameter parsing.")
    return;
  }

  const params = qs.parse(event.body);

  response_url = params.response_url;

  let config = {
    token: params.token,
    command: params.command,
    text: params.text
  }

  callback(null, config);
}

function sendError(err) {

  poster.json(response_url, buildErrorResponse(err))
    .catch(err => {
      console.error("Could not send error to slack ", err);
    })
}

function sendSuccess(message) {

  poster.json(response_url, listPullRequests(message))
    .catch(err => {
      console.error("Could not send good message to slack ", err);
    })
}

function buildErrorResponse(err) {

  return {
    statusCode: '400',
    text: (err.message || err || "Something went wrong. Sorry."),
    headers: {
      'Content-Type': 'application/json',
    }

  }
}

function buildGoodResponse(text) {

  let response = {
    statusCode: '200',
    response_type: "ephemeral",
    text: text,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return response;
}

function listPullRequests(message) {

  let text = ''
  let pr
  let timeagoInstance = new timeago();

  for (let i = message.length - 1; i >= 0; i--) {
    pr = message[i];

    text += `→ <${pr.url}|${pr.pr}> ${pr.title} (opened ${timeagoInstance.format(pr.date)})\n`;
  }

  return buildGoodResponse(text);
}
