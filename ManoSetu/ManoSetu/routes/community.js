/**
 * ManoSetu - Community Routes
 */

const express = require('express');
const router = express.Router();
const { createPost, getPosts, answerPost } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.post('/posts', protect, createPost);
router.get('/posts', getPosts);
router.post('/posts/:id/answers', protect, answerPost);

module.exports = router;
