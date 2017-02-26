'use strict';

const github = require('octonode')

const ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG;
const FIRST_PAGE = 1;
const MAX_REPOS_PER_PAGE = 100;

module.exports = {
    load: loadOpenPullRequests
}

let getAllRepos = (org, type) => {

    return new Promise(function(resolve, reject) {
      getRepos(org, type, FIRST_PAGE, [], (repos) => {
        resolve(repos)
      })
    });
}

let getRepos = (org, type, page, accumulatedRepos, callback) => {

  org.repos({type, page, per_page: MAX_REPOS_PER_PAGE}, (err, repos, headers) =>
  {

    if(err) return console.error(err);

    let concatenatedRepos = accumulatedRepos.concat(repos);
    if (repos.length < MAX_REPOS_PER_PAGE) {
      return callback(concatenatedRepos);
    } else {
      return getRepos(org, type, ++page, concatenatedRepos, callback);
    }
  })
};


let getAllOpenPulls = (client, repos) => {

  return new Promise(function(resolve, reject) {
    getOpenPulls(client, repos, (pulls) => {

      console.log("Number of pull requests:", pulls.length);
      resolve(pulls)
    })
  });
}

let getOpenPulls = (client, repos, callback) => {

  let count = repos.length;
  let openPulls = [];
  return Array.from(repos).map((repo) =>
    client.repo(repo.full_name).prs({per_page: 100, state: 'open'}, function(err, pulls, body, headers) {
      count = count - 1;
      openPulls = openPulls.concat(pulls);
      if (count === 0) { return callback(openPulls.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
      ); }
    }));
}


function loadOpenPullRequests(callback) {

  if(! ACCESS_TOKEN){
    return callback("Env GITHUB_ACCESS_TOKEN not defined")
  } else if(! GITHUB_ORG) {
    return callback("Env GITHUB_ORG not defined")
  }

  let client = github.client(ACCESS_TOKEN);
  let org = client.org(GITHUB_ORG);
  let type = 'all';

  getAllRepos(org, type)
  .catch(err => {

      console.error("Error while loading GitHub repos ");
  }).then( repos => {


    return getAllOpenPulls(client, repos)

  }).catch(err => {

      console.error("Error while loading GitHub Pull Requests ");
  }).then( pulls => {

    console.log(pulls[0]);

    return pulls.map( pull => {

        return {
          "title": pull.title.trim(),
          "url": pull.html_url,
          "pr": `${pull.head.repo.name}#${pull.number}`,
          "date": pull.created_at
        }
    })

  }).then( results => {

    callback(null, results);

  }).catch(err => {

      console.error("Error while handling github data");
      console.error(err);

      let errormsg = {
          statusCode: '400',
          text: "Could not parse github json data",
          headers: {
              'Content-Type': 'application/json',
          }
      }
      callback(errormsg);
  });

}
