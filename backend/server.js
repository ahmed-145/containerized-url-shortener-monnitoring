const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
const Papa = require('papaparse');

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/urls.db';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
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
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )
`);

// Generate unique short code
function generateShortCode(length = 6) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
}

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Enhanced URL validation with DNS lookup
async function validateUrlEnhanced(urlString) {
  // First check basic format
  if (!isValidUrl(urlString)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // Block common test/fake domains
    const blockedDomains = [
      'test.com', 'example.test', 'fake.com', 'dummy.com',
      'test.test', 'localhost', '127.0.0.1'
    ];

    if (blockedDomains.includes(hostname.toLowerCase())) {
      return { valid: false, error: 'Test/fake domain not allowed' };
    }

    // Check if domain has valid DNS (optional - can be slow)
    // Uncomment if you want DNS validation:
    ////////////////////////////////////////////////////////////////////
    const dns = require('dns').promises;
    try {
      await dns.lookup(hostname);
    } catch (err) {
      return { valid: false, error: 'Domain does not exist' };
    }
  //////////////////////////////////////////////////////////////////

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL' };
  }
}

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

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate or use custom short code
  let shortCode = customCode;
  if (!shortCode) {
    shortCode = generateShortCode();
  } else {
    // Validate custom code
   if (!/^[a-zA-Z0-9-_]{2,20}$/.test(shortCode)) {
      return res.status(400).json({ 
        error: 'Custom code must be 3-20 characters (letters, numbers, hyphens, underscores only)' 
      });
    }
  }

  // Check if short code already exists
  db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      if (customCode) {
        return res.status(409).json({ error: 'Custom code already exists' });
      }
      // Retry with new code if random collision
      shortCode = generateShortCode(8);
    }

    // Insert new URL
    db.run(
      'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
      [shortCode, url],
      function(err) {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Failed to create short URL' });
        }

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
    // Parse CSV
    const csvData = req.file.buffer.toString('utf8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    
    if (!parsed.data || parsed.data.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const results = [];
    
    // Process each row
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

      // Validate URL
      if (!isValidUrl(url)) {
        results.push({
          original_url: url,
          short_code: 'ERROR',
          short_url: 'Invalid URL format',
          status: 'failed'
        });
        continue;
      }

      // Generate short code
      let shortCode = customCode;
      if (!shortCode) {
        shortCode = generateShortCode();
      } else {
        // Validate custom code
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

      // Check if code exists
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
        // Generate new code if collision
        shortCode = generateShortCode(8);
      }

      // Insert URL
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
          [shortCode, url],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
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

    // Convert results to CSV
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

  // First check if the short code exists
  db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    try {
      // Generate short URL
      const shortUrl = `${req.protocol}://${req.get('host').replace(':3000', '')}/${shortCode}`;
      
      // Generate QR code as data URL
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

// Redirect handler
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
        return res.status(404).send('URL not found');
      }

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close(() => {
    console.log('Database closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 URL Shortener API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});