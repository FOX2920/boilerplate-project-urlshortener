require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const { URL } = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory database for URLs
const urls = {};
let urlCount = 1;

// Serve the main page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to shorten URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL using dns.lookup
  let urlObject;
  try {
    urlObject = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'Invalid URL' });
  }

  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    const shortUrl = urlCount++;
    urls[shortUrl] = originalUrl;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// API endpoint to redirect short URL to original URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urls[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
