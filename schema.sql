

CREATE DATABASE IF NOT EXISTS github_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE github_analyzer;

CREATE TABLE IF NOT EXISTS profiles (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    github_id           BIGINT,
    username            VARCHAR(255) UNIQUE,
    name                VARCHAR(255),
    bio                 TEXT,
    followers           INT,
    following           INT,
    public_repos        INT,
    account_age         INT,
    most_used_language  VARCHAR(100),
    total_stars         INT,
    total_forks         INT,
    top_repo            VARCHAR(255),
    profile_score       INT,
    profile_url         VARCHAR(500),
    avatar_url          VARCHAR(500),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
