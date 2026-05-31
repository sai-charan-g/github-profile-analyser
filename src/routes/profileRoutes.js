const express = require('express');
const router = express.Router();
const { analyzeProfile, getAllProfiles, getProfileByUsername, refreshProfile, deleteProfile } = require('../controllers/profileController');
const { analyzeLimiter } = require('../middleware/rateLimiter');

router.get('/', getAllProfiles);
router.post('/analyze/:username', analyzeLimiter, analyzeProfile);
router.get('/:username', getProfileByUsername);
router.get('/:username/refresh', refreshProfile);
router.delete('/:username', deleteProfile);

module.exports = router;
