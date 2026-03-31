/**
 * ManoSetu - Community Controller (Mongoose)
 */

const MentorPost = require('../models/MentorPost');
const User = require('../models/User');

// POST /api/community/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const post = await MentorPost.create({
      authorId: user.id,
      authorName: user.username, // Using the username as an anonymous nickname
      title,
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
