const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
const Papa = require('papaparse');
const client = require('prom-client');

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/urls.db';

// ==========================================
// PROMETHEUS METRICS SETUP
// ==========================================

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom Metrics

// 1. Counter: Total URLs shortened
const urlsShortenedCounter = new client.Counter({
  name: 'urls_shortened_total',
  help: 'Total number of URLs shortened',
  registers: [register]
});

// 2. Counter: Successful redirects
const successfulRedirectsCounter = new client.Counter({
  name: 'successful_redirects_total',
  help: 'Total number of successful URL redirects',
  registers: [register]
});

// 3. Counter: Failed lookups (404s)
const failedLookupsCounter = new client.Counter({
  name: 'failed_lookups_total',
  help: 'Total number of failed URL lookups (404 errors)',
  registers: [register]
});

// 4. Histogram: Request latency
const requestLatencyHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Additional useful metrics
const activeConnectionsGauge = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

// BONUS: Custom Business Metrics
// Counter for domains being shortened
const urlsByDomainCounter = new client.Counter({
  name: 'urls_shortened_by_domain_total',
  help: 'Total URLs shortened grouped by domain',
  labelNames: ['domain'],
  registers: [register]
});

// Gauge for total URLs in database
const totalUrlsGauge = new client.Gauge({
  name: 'total_urls_in_database',
  help: 'Total number of URLs stored in database',
  registers: [register]
});

// Counter for requests by hour
const requestsByHourCounter = new client.Counter({
  name: 'requests_by_hour_total',
  help: 'Total requests grouped by hour of day',
  labelNames: ['hour'],
  registers: [register]
});

// Gauge for click-through rate
const clickThroughRateGauge = new client.Gauge({
  name: 'click_through_rate',
  help: 'Ratio of redirects to total URLs created',
  registers: [register]
});

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return 'invalid';
  }
}

// Helper function to get current hour
function getCurrentHour() {
  return new Date().getHours().toString();
}

// Update total URLs gauge periodically
function updateGaugeMetrics() {
  db.get('SELECT COUNT(*) as count FROM urls', (err, row) => {
    if (!err && row) {
      totalUrlsGauge.set(row.count);
    }
  });
  
  // Update click-through rate
  db.get('SELECT COUNT(*) as total_urls, SUM(clicks) as total_clicks FROM urls', (err, row) => {
    if (!err && row && row.total_urls > 0) {
      const rate = (row.total_clicks || 0) / row.total_urls;
      clickThroughRateGauge.set(rate);
    }
  });
}


// BONUS: Custom Database Metrics Exporter
const dbSizeGauge = new client.Gauge({
  name: 'database_size_bytes',
  help: 'Size of the SQLite database file in bytes',
  registers: [register]
});

const dbConnectionsGauge = new client.Gauge({
  name: 'database_connections',
  help: 'Number of active database connections',
  registers: [register]
});

const oldestUrlGauge = new client.Gauge({
  name: 'oldest_url_age_seconds',
  help: 'Age of the oldest URL in the database (in seconds)',
  registers: [register]
});

const mostClickedUrlGauge = new client.Gauge({
  name: 'most_clicked_url_clicks',
  help: 'Number of clicks on the most popular URL',
  registers: [register]
});



// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Middleware to track request latency
app.use((req, res, next) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnectionsGauge.inc();
  
  // Track requests by hour (BONUS)
  requestsByHourCounter.labels(getCurrentHour()).inc();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to capture metrics
  res.end = function(...args) {
    // Calculate duration in seconds
    const duration = (Date.now() - start) / 1000;
    
    // Record latency
    requestLatencyHistogram
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    // Decrement active connections
    activeConnectionsGauge.dec();
    
    // Call original end function
    originalEnd.apply(res, args);
  };
  
  next();
});

// ==========================================
// DATABASE SETUP
// ==========================================

const dbDir = path.dirname(DB_PATH);
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create table
// Create table and initialize metrics AFTER db is ready
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error('Table creation error:', err);
  } else {
    console.log('✅ Database table ready');
    
    // NOW initialize gauge metrics (AFTER DB is ready)
    updateGaugeMetrics();
    
    // Set up periodic gauge updates
    setInterval(updateGaugeMetrics, 30000);
    
    // Update database metrics
    setInterval(() => {
      // Get database file size
      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        dbSizeGauge.set(stats.size);
      }
      
      // Get oldest URL age
      db.get('SELECT created_at FROM urls ORDER BY created_at ASC LIMIT 1', (err, row) => {
        if (!err && row) {
          const ageSeconds = (Date.now() - new Date(row.created_at).getTime()) / 1000;
          oldestUrlGauge.set(ageSeconds);
        }
      });
      
      // Get most clicked URL
      db.get('SELECT MAX(clicks) as max_clicks FROM urls', (err, row) => {
        if (!err && row && row.max_clicks) {
          mostClickedUrlGauge.set(row.max_clicks);
        }
      });
      
      // Database connections
      dbConnectionsGauge.set(1);
    }, 30000);
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function generateShortCode(length = 6) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

async function validateUrlEnhanced(urlString) {
  if (!isValidUrl(urlString)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    const blockedDomains = [
      'test.com', 'example.test', 'fake.com', 'dummy.com',
      'test.test', 'localhost', '127.0.0.1'
    ];

    if (blockedDomains.includes(hostname.toLowerCase())) {
      return { valid: false, error: 'Test/fake domain not allowed' };
    }

    const dns = require('dns').promises;
    try {
      await dns.lookup(hostname);
    } catch (err) {
      return { valid: false, error: 'Domain does not exist' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL' };
  }
}

// ==========================================
// PROMETHEUS METRICS ENDPOINT
// ==========================================

app.get('/metrics', async (req, res) => {
  try {
    // Add CORS headers for browser access
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// BONUS: Metrics JSON Export
app.get('/api/metrics/json', async (req, res) => {
  try {
    const metricsText = await register.metrics();
    const lines = metricsText.split('\n');
    const metricsJson = {
      timestamp: new Date().toISOString(),
      metrics: {}
    };
    
    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;
      
      const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*?)(?:\{(.+?)\})?\s+(.+)$/);
      if (match) {
        const [, name, labels, value] = match;
        
        if (!metricsJson.metrics[name]) {
          metricsJson.metrics[name] = [];
        }
        
        const labelObj = {};
        if (labels) {
          const labelPairs = labels.match(/(\w+)="([^"]*)"/g);
          if (labelPairs) {
            labelPairs.forEach(pair => {
              const [key, val] = pair.split('=');
              labelObj[key] = val.replace(/"/g, '');
            });
          }
        }
        
        metricsJson.metrics[name].push({
          labels: labelObj,
          value: parseFloat(value)
        });
      }
    }
    
    res.json(metricsJson);
  } catch (error) {
    console.error('Metrics JSON error:', error);
    res.status(500).json({ error: 'Failed to export metrics as JSON' });
  }
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API: Validate URL
app.post('/api/validate-url', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ valid: false, error: 'URL is required' });
  }

  const validation = await validateUrlEnhanced(url);
  res.json(validation);
});

// API: Check if URL already shortened
app.post('/api/check-existing', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  db.get(
    'SELECT * FROM urls WHERE original_url = ? ORDER BY created_at DESC LIMIT 1',
    [url],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        const shortUrl = `http://localhost/${row.short_code}`;
        res.json({
          exists: true,
          shortCode: row.short_code,
          shortUrl: shortUrl,
          clicks: row.clicks,
          createdAt: row.created_at
        });
      } else {
        res.json({ exists: false });
      }
    }
  );
});

// API: Shorten URL
app.post('/api/shorten', async (req, res) => {
  const { url, customCode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode = customCode;
  if (!shortCode) {
    shortCode = generateShortCode();
  } else {
    if (!/^[a-zA-Z0-9-_]{2,20}$/.test(shortCode)) {
      return res.status(400).json({ 
        error: 'Custom code must be 3-20 characters (letters, numbers, hyphens, underscores only)' 
      });
    }
  }

  db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      if (customCode) {
        return res.status(409).json({ error: 'Custom code already exists' });
      }
      shortCode = generateShortCode(8);
    }

    db.run(
      'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
      [shortCode, url],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Failed to create short URL' });
        }

        // Increment URLs shortened counter
        urlsShortenedCounter.inc();
        
        // BONUS: Track domain being shortened
        const domain = extractDomain(url);
        urlsByDomainCounter.labels(domain).inc();

        const shortUrl = `${req.protocol}://${req.get('host').replace(':3000', '')}/${shortCode}`;
        res.status(201).json({
          success: true,
          shortCode,
          shortUrl,
          originalUrl: url,
          id: this.lastID
        });
      }
    );
  });
});

// API: Get all URLs (with pagination)
app.get('/api/urls', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(
    'SELECT * FROM urls ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT COUNT(*) as count FROM urls', (err, countRow) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          urls: rows,
          pagination: {
            page,
            limit,
            total: countRow.count,
            totalPages: Math.ceil(countRow.count / limit)
          }
        });
      });
    }
  );
});

// API: Get URL stats
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT * FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }
      res.json(row);
    }
  );
});

// API: Delete URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run('DELETE FROM urls WHERE short_code = ?', [shortCode], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    res.json({ success: true, message: 'URL deleted successfully' });
  });
});

// API: Bulk URL Shortening (CSV Upload)
app.post('/api/bulk-shorten', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const csvData = req.file.buffer.toString('utf8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    
    if (!parsed.data || parsed.data.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const results = [];
    
    for (const row of parsed.data) {
      const url = row.url || row.URL || row.Url;
      const customCode = row.code || row.custom_code || '';
      
      if (!url) {
        results.push({
          original_url: 'N/A',
          short_code: 'ERROR',
          short_url: 'Missing URL in CSV',
          status: 'failed'
        });
        continue;
      }

      if (!isValidUrl(url)) {
        results.push({
          original_url: url,
          short_code: 'ERROR',
          short_url: 'Invalid URL format',
          status: 'failed'
        });
        continue;
      }

      let shortCode = customCode;
      if (!shortCode) {
        shortCode = generateShortCode();
      } else {
        if (!/^[a-zA-Z0-9-_]{2,20}$/.test(shortCode)) {
          results.push({
            original_url: url,
            short_code: 'ERROR',
            short_url: 'Invalid custom code format',
            status: 'failed'
          });
          continue;
        }
      }

      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existing) {
        if (customCode) {
          results.push({
            original_url: url,
            short_code: 'ERROR',
            short_url: 'Code already exists',
            status: 'failed'
          });
          continue;
        }
        shortCode = generateShortCode(8);
      }

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
          [shortCode, url],
                      function(err) {
            if (err) reject(err);
            else {
              // Increment URLs shortened counter for each successful bulk operation
              urlsShortenedCounter.inc();
              
              // BONUS: Track domain for bulk operations
              const domain = extractDomain(url);
              urlsByDomainCounter.labels(domain).inc();
              
              resolve(this.lastID);
            }
          }
        );
      });

      const shortUrl = `${req.protocol}://${req.get('host').replace(':3000', '')}/${shortCode}`;
      results.push({
        original_url: url,
        short_code: shortCode,
        short_url: shortUrl,
        status: 'success'
      });
    }

    const csv = Papa.unparse(results);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=shortened-urls.csv');
    res.send(csv);

  } catch (error) {
    console.error('Bulk shorten error:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// API: Generate QR Code
app.get('/api/qr/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    try {
      const shortUrl = `${req.protocol}://${req.get('host').replace(':3000', '')}/${shortCode}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.json({
        success: true,
        shortCode,
        shortUrl,
        qrCode: qrCodeDataUrl
      });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });
});

// ==========================================
// REDIRECT HANDLER (with metrics)
// ==========================================

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT * FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
      }

      if (!row) {
        // Increment failed lookups counter
        failedLookupsCounter.inc();
        return res.status(404).send('URL not found');
      }

      // Increment successful redirects counter
      successfulRedirectsCounter.inc();

      // Increment click counter
      db.run(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
        [shortCode]
      );

      // Redirect
      res.redirect(301, row.original_url);
    }
  );
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close(() => {
    console.log('Database closed');
    process.exit(0);
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 URL Shortener API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics endpoint: http://localhost:${PORT}/metrics`);
});