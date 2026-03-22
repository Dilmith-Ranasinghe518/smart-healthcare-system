const { StreamClient } = require('@stream-io/node-sdk');

// @desc    Get Stream token for video call
// @route   GET /api/telemedicine/stream-token
// @access  Private
const getStreamToken = async (req, res) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ message: 'Stream API configuration missing' });
    }

    const client = new StreamClient(apiKey, apiSecret);
    const token = client.generateUserToken({ user_id: req.user._id.toString() });

    res.status(200).json({ token, apiKey });

  } catch (error) {
    console.error('Stream Token Error:', error);
    res.status(500).json({ message: 'Server Error generating token' });
  }
};

module.exports = {
  getStreamToken,
};
