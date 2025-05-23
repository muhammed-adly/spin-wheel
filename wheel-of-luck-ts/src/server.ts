import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

app.get('/', (req, res) => {
  // Log the IP address of the visitor
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`📥 New visitor: ${ip} at ${new Date().toISOString()}`);

  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🎯 Server running at http://localhost:${PORT}`);
});
