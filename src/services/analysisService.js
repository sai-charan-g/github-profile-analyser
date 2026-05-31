function getMostUsedLanguage(repos) {
  const counts = {};
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  }
  if (!Object.keys(counts).length) return null;
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
}

function getTopRepo(repos) {
  if (!repos.length) return null;
  const top = repos.reduce((a, b) => b.stargazers_count > a.stargazers_count ? b : a);
  return top.stargazers_count > 0 ? top.full_name : null;
}

function totalStars(repos) {
  return repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
}

function totalForks(repos) {
  return repos.reduce((s, r) => s + (r.forks_count || 0), 0);
}

function accountAge(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt)) / 86400000);
}

function profileScore(user, stars) {
  let s = 0;
  s += Math.min(30, Math.log10(user.followers + 1) * 10);
  s += Math.min(25, Math.log10(stars + 1) * 8);
  s += Math.min(20, (user.public_repos / 100) * 20);
  s += Math.min(15, (accountAge(user.created_at) / 365) * 5);
  if (user.followers > 0) {
    s += (1 - Math.min(1, user.following / user.followers)) * 10;
  }
  return Math.round(s);
}

function buildAnalysis(user, repos) {
  const stars = totalStars(repos);
  return {
    github_id:          user.id,
    username:           user.login,
    name:               user.name || null,
    bio:                user.bio || null,
    followers:          user.followers || 0,
    following:          user.following || 0,
    public_repos:       user.public_repos || 0,
    account_age:        accountAge(user.created_at),
    most_used_language: getMostUsedLanguage(repos),
    total_stars:        stars,
    total_forks:        totalForks(repos),
    top_repo:           getTopRepo(repos),
    profile_score:      profileScore(user, stars),
    profile_url:        user.html_url,
    avatar_url:         user.avatar_url || null,
  };
}

module.exports = { buildAnalysis };
