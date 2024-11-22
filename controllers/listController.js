const List = require('../models/listModel');
const http = require('http');

const createList = async (req, res) => {
  try {
    const { name, description, movies, isPublic, tags } = req.body;
    const list = await List.create({
      name,
      description,
      creator: req.user.id,
      movies,
      isPublic,
      tags
    });
    
    res.status(201).json({ list });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getLists = async (req, res) => {
  try {
    const lists = await List.find({ isPublic: true })
      .populate('creator', 'username')
      .populate('movies', 'title posterPath releaseDate')
      .populate('followers', 'username');
    
    res.status(200).json({ lists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserLists = async (req, res) => {
  try {
    const lists = await List.find({ creator: req.user.id })
      .populate('movies', 'title posterPath releaseDate')
      .populate('followers', 'username');
    
    res.status(200).json({ lists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findOneAndUpdate(
      { _id: id, creator: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.status(200).json({ list });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findOneAndDelete({ _id: id, creator: req.user.id });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const followList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    if (!list.followers.includes(req.user.id)) {
      list.followers.push(req.user.id);
      await list.save();
    }
    
    const updatedList = await List.findById(id)
      .populate('creator', 'username')
      .populate('movies', 'title posterPath releaseDate')
      .populate('followers', 'username');
    
    res.status(200).json({ message: 'List followed successfully', list: updatedList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unfollowList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    list.followers = list.followers.filter(
      followerId => followerId.toString() !== req.user.id
    );
    await list.save();
    
    const updatedList = await List.findById(id)
      .populate('creator', 'username')
      .populate('movies', 'title posterPath releaseDate')
      .populate('followers', 'username');
    
    res.status(200).json({ message: 'List unfollowed successfully', list: updatedList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createList,
  getLists,
  getUserLists,
  updateList,
  deleteList,
  followList,
  unfollowList
};