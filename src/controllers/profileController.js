const { pool } = require('../config/db');
const { fetchUserProfile, fetchUserRepos } = require('../services/githubService');
const { buildAnalysis } = require('../services/analysisService');

function fmt(row) {
  return {
    id:                 row.id,
    github_id:          row.github_id,
    username:           row.username,
    name:               row.name,
    bio:                row.bio,
    followers:          row.followers,
    following:          row.following,
    public_repos:       row.public_repos,
    account_age:        row.account_age,
    most_used_language: row.most_used_language,
    total_stars:        row.total_stars,
    total_forks:        row.total_forks,
    top_repo:           row.top_repo,
    profile_score:      row.profile_score,
    profile_url:        row.profile_url,
    avatar_url:         row.avatar_url,
    created_at:         row.created_at,
  };
}

const VALID_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

const UPSERT = `
  INSERT INTO profiles (
    github_id, username, name, bio, followers, following,
    public_repos, account_age, most_used_language, total_stars,
    total_forks, top_repo, profile_score, profile_url, avatar_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    github_id = VALUES(github_id), name = VALUES(name), bio = VALUES(bio),
    followers = VALUES(followers), following = VALUES(following),
    public_repos = VALUES(public_repos), account_age = VALUES(account_age),
    most_used_language = VALUES(most_used_language), total_stars = VALUES(total_stars),
    total_forks = VALUES(total_forks), top_repo = VALUES(top_repo),
    profile_score = VALUES(profile_score), profile_url = VALUES(profile_url),
    avatar_url = VALUES(avatar_url)
`;

function upsertValues(a) {
  return [
    a.github_id, a.username, a.name, a.bio, a.followers, a.following,
    a.public_repos, a.account_age, a.most_used_language, a.total_stars,
    a.total_forks, a.top_repo, a.profile_score, a.profile_url, a.avatar_url,
  ];
}

async function analyzeProfile(req, res, next) {
  try {
    const { username } = req.params;

    if (!VALID_USERNAME.test(username)) {
      return res.status(400).json({ success: false, message: 'Invalid GitHub username' });
    }

    const [existing] = await pool.execute('SELECT * FROM profiles WHERE username = ?', [username]);
    if (existing.length > 0 && new Date(existing[0].created_at) > new Date(Date.now() - 3600000)) {
      return res.status(200).json({ success: true, cached: true, data: fmt(existing[0]) });
    }

    const [user, repos] = await Promise.all([fetchUserProfile(username), fetchUserRepos(username)]);
    const a = buildAnalysis(user, repos);

    await pool.execute(UPSERT, upsertValues(a));

    const [rows] = await pool.execute('SELECT * FROM profiles WHERE username = ?', [username]);
    return res.status(201).json({ success: true, cached: false, repos_analyzed: repos.length, data: fmt(rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function getAllProfiles(req, res, next) {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const sortBy = ['profile_score', 'followers', 'total_stars', 'public_repos', 'created_at'].includes(req.query.sort)
      ? req.query.sort : 'created_at';
    const order  = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM profiles');
    const [rows] = await pool.query(`SELECT * FROM profiles ORDER BY ${sortBy} ${order} LIMIT ${limit} OFFSET ${offset}`);

    return res.json({
      success: true,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
      data: rows.map(fmt),
    });
  } catch (err) {
    next(err);
  }
}

async function getProfileByUsername(req, res, next) {
  try {
    const [rows] = await pool.execute('SELECT * FROM profiles WHERE username = ?', [req.params.username]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: `'${req.params.username}' not found. Analyze it first.` });
    }
    return res.json({ success: true, data: fmt(rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function refreshProfile(req, res, next) {
  try {
    const { username } = req.params;
    if (!VALID_USERNAME.test(username)) {
      return res.status(400).json({ success: false, message: 'Invalid GitHub username' });
    }

    const [user, repos] = await Promise.all([fetchUserProfile(username), fetchUserRepos(username)]);
    const a = buildAnalysis(user, repos);

    await pool.execute(UPSERT, upsertValues(a));

    const [rows] = await pool.execute('SELECT * FROM profiles WHERE username = ?', [username]);
    return res.json({ success: true, repos_analyzed: repos.length, data: fmt(rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function deleteProfile(req, res, next) {
  try {
    const [result] = await pool.execute('DELETE FROM profiles WHERE username = ?', [req.params.username]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: `'${req.params.username}' not found` });
    }
    return res.json({ success: true, message: `'${req.params.username}' deleted` });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeProfile, getAllProfiles, getProfileByUsername, refreshProfile, deleteProfile };
