const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({
  url: REDIS_URL
});

client.on('error', (err) => console.error('Redis error:', err));

(async () => {
  await client.connect(); 
  console.log('Redis client connected');
})();

module.exports = client;