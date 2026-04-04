const cron = require('node-cron');
const Appointment = require('../models/Appointment');

const initCron = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running Cron Job: Cleaning up unpaid appointments...');
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      // Find appointments that are still AWAITING_PAYMENT and were created more than 30 mins ago
      const result = await Appointment.updateMany(
        {
          status: 'AWAITING_PAYMENT',
          createdAt: { $lt: thirtyMinutesAgo }
        },
        {
          $set: { 
            status: 'CANCELLED',
            statusReason: 'Payment timeout: Appointment cancelled automatically after 30 minutes of inactivity.'
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Cron Job: Cancelled ${result.modifiedCount} unpaid appointments.`);
      }
    } catch (err) {
      console.error('Cron Job Error:', err);
    }
  });
};

module.exports = initCron;
