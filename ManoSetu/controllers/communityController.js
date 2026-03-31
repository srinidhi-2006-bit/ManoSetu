/**
 * ManoSetu - Community Controller
 * Supports Mongoose (DB) and Shared In-Memory Store (MOCK_DB)
 */

const MentorPost = require('../models/MentorPost');
const User = require('../models/User');
const store = require('../config/store');

const IS_MOCK = process.env.MOCK_DB === 'true';

// POST /api/community/posts
const createPost = async (req, res, next) => {
  try {
    const { text, title } = req.body; // text from UI, title optional
    const content = text || req.body.content;
    const user = req.user;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required.' });
    }

    if (IS_MOCK) {
      const icons = ['🦊', '🦉', '🐱', '🐶', '🐼', '🐨'];
      const newPost = {
        id: 'p' + (store.communityPosts.length + 1) + '-' + Date.now(),
        authorIcon: icons[Math.floor(Math.random() * icons.length)],
        authorName: 'Anonymous ' + (user.username || 'User'),
        text: content,
        hugsCount: 0,
        replies: [],
        ts: new Date().toISOString()
      };
      store.communityPosts.unshift(newPost);
      return res.status(201).json({ success: true, post: newPost });
    }

    const post = await MentorPost.create({
      authorId: user.id,
      authorName: user.username,
      title: title || 'Safe Board Post',
      content
    });

    res.status(201).json({ success: true, message: 'Your question has been posted safely.', post });
  } catch (error) {
    next(error);
  }
};

// GET /api/community/posts
const getPosts = async (req, res, next) => {
  try {
    if (IS_MOCK) {
       return res.json({ success: true, posts: store.communityPosts });
    }
    const posts = await MentorPost.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// POST /api/community/posts/:id/answers
const answerPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (IS_MOCK) {
      const post = store.communityPosts.find(p => p.id === id);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
      
      post.replies.push({
        author: user.username,
        text,
        ts: new Date().toISOString()
      });
      return res.json({ success: true, post });
    }

    // Check if user is a mentor
    const dbUser = await User.findById(user.id);
    if (!dbUser || dbUser.role !== 'mentor') {
      return res.status(403).json({ success: false, error: 'Only vetted Mentors can answer questions.' });
    }

    const post = await MentorPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    post.answers.push({
      mentorId: user.id,
      mentorName: user.username,
      text
    });
    
    post.isResolved = true;
    await post.save();

    res.json({ success: true, message: 'Answer posted.', post });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, getPosts, answerPost };

