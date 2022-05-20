const process = require("node:process");

module.exports = {
  application: {
    mongodbUrl: process.env.MONGO_URL,
  },
  plugins: [
    "@indiekit/preset-jekyll",
    "@indiekit/store-github",
    "@indiekit/syndicator-mastodon",
    "@indiekit/syndicator-twitter",
  ],
  publication: {
    me: process.env.PUBLICATION_URL,
    timeZone: process.env.TZ,
  },
  "@indiekit/store-github": {
    user: process.env.GITHUB_USER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH,
  },
  "@indiekit/syndicator-mastodon": {
    checked: true,
    forced: true,
    url: process.env.MASTODON_URL,
    user: process.env.MASTODON_USER,
  },
  "@indiekit/syndicator-twitter": {
    checked: true,
    forced: true,
    user: process.env.TWITTER_USER,
  },
};
