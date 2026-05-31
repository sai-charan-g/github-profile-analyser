const axios = require('axios');

const gh = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    }),
  },
});

async function fetchUserProfile(username) {
  try {
    const res = await gh.get(`/users/${username}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) throw new Error(`GitHub user '${username}' not found`);
    if (err.response?.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error(`GitHub API error: ${err.response?.data?.message || err.message}`);
  }
}

async function fetchUserRepos(username) {
  try {
    const repos = [];
    let page = 1;

    while (true) {
      const res = await gh.get(`/users/${username}/repos`, {
        params: { type: 'owner', sort: 'updated', per_page: 100, page },
      });
      repos.push(...res.data);
      if (res.data.length < 100 || repos.length >= 500) break;
      page++;
    }

    return repos;
  } catch (err) {
    if (err.response?.status === 403) throw new Error('GitHub API rate limit exceeded');
    console.warn(`Could not fetch repos for ${username}: ${err.message}`);
    return [];
  }
}

module.exports = { fetchUserProfile, fetchUserRepos };
