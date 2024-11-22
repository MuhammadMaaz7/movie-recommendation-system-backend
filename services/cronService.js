const cron = require('node-cron');
const { processUpcomingNotifications } = require('../controllers/notificationController');

const initNotificationCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running notification check cron job');
    try {
      await processUpcomingNotifications();
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  });
};

module.exports = { initNotificationCron };