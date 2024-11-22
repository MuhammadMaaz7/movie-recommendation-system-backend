const Notification = require('../models/notificationModel');
const Movie = require('../models/movieModel');
const { sendEmail } = require('../utils/emailService');

const setMovieReminder = async (req, res) => {
  try {
    const { movieId, type } = req.body;
    const userId = req.user.id; // Assuming you have auth middleware setting req.user

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      userId,
      movieId,
      type
    });

    if (existingNotification) {
      return res.status(400).json({ message: 'Reminder already set for this movie' });
    }

    const notification = new Notification({
      userId,
      movieId,
      type,
      releaseDate: type === 'RELEASE' ? movie.releaseDate : movie.trailerDate
    });

    await notification.save();

    res.status(201).json({
      message: 'Reminder set successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .populate('movieId', 'title posterUrl releaseDate trailerDate')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This function will be called by a cron job
const processUpcomingNotifications = async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
    const upcomingNotifications = await Notification.find({
      releaseDate: { $lte: threeDaysFromNow },
      notificationSent: false
    }).populate('userId movieId');
  
    for (const notification of upcomingNotifications) {
      try {
        await sendEmail({
          to: notification.userId.email,
          subject: `Upcoming ${notification.type}: ${notification.movieId.title}`,
          text: `The ${notification.type === 'RELEASE' ? 'movie' : 'trailer'} "${notification.movieId.title}" 
                will be available in ${Math.ceil((notification.releaseDate - new Date()) / (1000 * 60 * 60 * 24))} days!`
        });
  
        notification.notificationSent = true;
        await notification.save();
        console.log(`Notification sent successfully for ${notification._id}`);
      } catch (error) {
        console.error(`Failed to process notification ${notification._id}:`, error);
        // Don't mark as sent if there was an error
      }
    }
  };

module.exports = {
  setMovieReminder,
  getUserNotifications,
  markNotificationAsRead,
  processUpcomingNotifications
};