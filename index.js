'use strict';

let github_pulls = require('./github-pulls.js')

//exports.handler = (event, context, callback) => {

  console.log("Starting...")
  github_pulls.load((err, results) => {

      if(err){
        console.error(err);
        return;
      }

      console.log(results);
  })

//}
