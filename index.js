'use strict';

const github_pulls = require('./github-pulls.js')
const slack = require('./slack.js')

let command;

exports.handler = (event, context, callback) => {

  console.log("Starting...")

  slack.digestPush(event, (err, config) => {

    if (err) {
      console.error(err);
      callback(slack.badJSON(err));
      return;
    }

    callback(null, slack.goodJSON("Loading PRs..."));

    //YAGNI? :-)
    command = config;

    github_pulls.load((err, results) => {

      if (err) {
        console.error(err);
        slack.sendError(err);
        return;
      }

      console.log(results);
      slack.sendSuccess(results);
    })
  });

}
