import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export const cacheRecommendations = async (req, res, next) => {
  try {
    // Only cache if Redis is connected
    if (!redisClient.isReady) {
      return next();
    }

    const key = `recommendations:${req.user?._id || ''}:${req.params.movieId || ''}`;
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json method
    res.json = async function(data) {
      // Cache the data for 1 hour
      await redisClient.setEx(key, 3600, JSON.stringify(data));
      
      // Call original res.json with data
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    next(error);
  }
};