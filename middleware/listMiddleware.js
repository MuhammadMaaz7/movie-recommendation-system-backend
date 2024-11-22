const List = require('../models/listModel');
const http = require('http');

const validateListOwnership = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    if (list.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateListAccess = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    if (!list.isPublic && list.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This list is private' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateListOwnership,
  validateListAccess
};