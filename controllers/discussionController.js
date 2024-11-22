// controllers/discussionController.js
const Discussion = require('../models/discussionModel');

exports.createDiscussion = async (req, res) => {
  try {
    const discussion = new Discussion({
      ...req.body,
      author: req.user._id
    });
    await discussion.save();
    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    const { category, tag, movie, actor, genre, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (movie) query.relatedMovie = movie;
    if (actor) query.relatedActor = actor;
    if (genre) query.relatedGenre = genre;
    
    const discussions = await Discussion.find(query)
      .sort(sort)
      .populate('author', 'name avatar')
      .populate('relatedMovie', 'title posterUrl')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Discussion.countDocuments(query);
    
    res.json({
      discussions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .populate('relatedMovie', 'title posterUrl');
      
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    
    discussion.comments.push({
      content: req.body.content,
      author: req.user._id
    });
    
    await discussion.save();
    
    // Populate the newly added comment's author
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('comments.author', 'name avatar');
      
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    
    const userLikeIndex = discussion.likes.indexOf(req.user._id);
    if (userLikeIndex === -1) {
      discussion.likes.push(req.user._id);
    } else {
      discussion.likes.splice(userLikeIndex, 1);
    }
    
    await discussion.save();
    res.json({ likes: discussion.likes.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const discussion = await Discussion.findOne({
      '_id': req.params.discussionId,
      'comments._id': req.params.commentId
    });
    
    if (!discussion) return res.status(404).json({ message: 'Discussion or comment not found' });
    
    const comment = discussion.comments.id(req.params.commentId);
    const userLikeIndex = comment.likes.indexOf(req.user._id);
    
    if (userLikeIndex === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(userLikeIndex, 1);
    }
    
    await discussion.save();
    res.json({ likes: comment.likes.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};