const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Cerebras = require('@cerebras/cerebras_cloud_sdk');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://grafana:3000';
const GRAFANA_USER = process.env.GRAFANA_USER || 'admin';
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD || 'admin';
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || 'csk-2cvh4kc9f58wwr4he68mtdhp23vmkmwhjnfcmcyvprvttyve';
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';
const REPORTS_DIR = process.env.REPORTS_DIR || '/app/reports';

// Initialize Cerebras client
const cerebras = new Cerebras({
  apiKey: CEREBRAS_API_KEY
});

app.use(express.json());

// Ensure reports directory exists
(async () => {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    console.log(`📁 Reports directory ready: ${REPORTS_DIR}`);
  } catch (err) {
    console.error('Failed to create reports directory:', err);
  }
})();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

async function fetchPrometheusMetrics() {
  try {
    const queries = [
      { name: 'total_urls', query: 'total_urls_in_database', description: 'Total URLs stored' },
      { name: 'urls_shortened_rate', query: 'rate(urls_shortened_total[5m])', description: 'URL creation rate (per second)' },
      { name: 'redirect_rate', query: 'rate(successful_redirects_total[5m])', description: 'Successful redirects (per second)' },
      { name: 'error_rate', query: 'rate(failed_lookups_total[5m])', description: '404 error rate (per second)' },
      { name: 'p50_latency', query: 'histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))', description: 'P50 latency (median)' },
      { name: 'p95_latency', query: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))', description: 'P95 latency' },
      { name: 'p99_latency', query: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))', description: 'P99 latency' },
      { name: 'active_connections', query: 'active_connections', description: 'Current active connections' },
      { name: 'click_through_rate', query: 'click_through_rate', description: 'Click-through rate (ratio)' },
      { name: 'database_size_mb', query: 'database_size_bytes / 1024 / 1024', description: 'Database size (MB)' },
      { name: 'total_urls_shortened', query: 'urls_shortened_total', description: 'Cumulative URLs shortened' },
      { name: 'total_redirects', query: 'successful_redirects_total', description: 'Cumulative successful redirects' },
      { name: 'total_404s', query: 'failed_lookups_total', description: 'Cumulative 404 errors' }
    ];

    const results = {};
    
    for (const { name, query, description } of queries) {
      try {
        const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
          params: { query },
          timeout: 5000
        });
        
        if (response.data.status === 'success' && response.data.data.result.length > 0) {
          const value = parseFloat(response.data.data.result[0].value[1]);
          results[name] = { value: value, description: description };
        } else {
          results[name] = { value: 0, description: description };
        }
      } catch (err) {
        console.warn(`Failed to fetch ${name}:`, err.message);
        results[name] = { value: 0, description: description };
      }
    }
    
    // Fetch top domains
    try {
      const domainsResponse = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
        params: { query: 'topk(5, urls_shortened_by_domain_total)' },
        timeout: 5000
      });
      
      if (domainsResponse.data.status === 'success') {
        results.top_domains = domainsResponse.data.data.result.map(item => ({
          domain: item.metric.domain,
          count: parseFloat(item.value[1])
        }));
      }
    } catch (err) {
      results.top_domains = [];
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching Prometheus metrics:', error);
    throw error;
  }
}

/**
 * Capture Grafana dashboard as PNG and convert to JPEG for PDFKit compatibility
 */
async function captureDashboardSnapshot(dashboardUid) {
  try {
    const auth = Buffer.from(`${GRAFANA_USER}:${GRAFANA_PASSWORD}`).toString('base64');
    const renderUrl = `${GRAFANA_URL}/render/d-solo/${dashboardUid}?width=1200&height=600&theme=dark`;
    
    console.log(`📸 Capturing: ${dashboardUid}...`);
    
    const response = await axios.get(renderUrl, {
      headers: { 'Authorization': `Basic ${auth}` },
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const pngBuffer = Buffer.from(response.data);
    console.log(`  Downloaded PNG: ${(pngBuffer.length / 1024).toFixed(2)} KB`);
    
    // Convert PNG to JPEG using sharp (PDFKit handles JPEG better)
    const jpegBuffer = await sharp(pngBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();
    
    console.log(`  Converted to JPEG: ${(jpegBuffer.length / 1024).toFixed(2)} KB`);
    
    return jpegBuffer;
  } catch (error) {
    console.error('Error capturing dashboard:', error.message);
    throw error;
  }
}

async function analyzeWithCerebras(metrics) {
  try {
    const prompt = `You are an expert DevOps engineer analyzing monitoring data for a production URL shortener service.

## CURRENT METRICS SUMMARY

### Performance Metrics
- Total URLs in database: ${metrics.total_urls.value.toFixed(0)}
- URL creation rate: ${metrics.urls_shortened_rate.value.toFixed(3)} URLs/sec
- Redirect rate: ${metrics.redirect_rate.value.toFixed(3)} requests/sec
- Error rate: ${metrics.error_rate.value.toFixed(4)} errors/sec

### Latency Analysis
- P50 latency: ${(metrics.p50_latency.value * 1000).toFixed(2)}ms
- P95 latency: ${(metrics.p95_latency.value * 1000).toFixed(2)}ms
- P99 latency: ${(metrics.p99_latency.value * 1000).toFixed(2)}ms

### Resource Utilization
- Active connections: ${metrics.active_connections.value.toFixed(0)}
- Database size: ${metrics.database_size_mb.value.toFixed(2)} MB
- Click-through rate: ${(metrics.click_through_rate.value * 100).toFixed(2)}%

### Cumulative Statistics
- Total URLs shortened: ${metrics.total_urls_shortened.value.toFixed(0)}
- Total successful redirects: ${metrics.total_redirects.value.toFixed(0)}
- Total 404 errors: ${metrics.total_404s.value.toFixed(0)}

### Top 5 Domains
${metrics.top_domains && metrics.top_domains.length > 0 
  ? metrics.top_domains.map((d, i) => `${i + 1}. ${d.domain}: ${d.count} URLs`).join('\n')
  : 'No domain data available'}

Provide comprehensive DevOps analysis with 6 sections: Executive Summary, Performance Analysis, Actionable Recommendations (5-7 items with priorities), Capacity Planning, Risk Assessment, and Trend Observations. Be specific and data-driven.`;

    console.log('🤖 Analyzing with Cerebras AI...');
    
    const completion = await cerebras.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert DevOps engineer specializing in monitoring and performance optimization." },
        { role: "user", content: prompt }
      ],
      model: 'llama-3.3-70b',
      max_completion_tokens: 2048,
      temperature: 0.3,
      top_p: 0.95,
      stream: false
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Cerebras API error:', error.message);
    throw error;
  }
}

/**
 * Generate PDF report WITH dashboard images
 */
async function generatePdfReport(analysis, metrics, snapshots) {
  return new Promise(async (resolve, reject) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `report_${timestamp}.pdf`;
      const filepath = path.join(REPORTS_DIR, filename);
      
      // Save snapshots as temporary JPEG files
      const tempFiles = [];
      for (let i = 0; i < snapshots.length; i++) {
        const tempPath = path.join(REPORTS_DIR, `temp_${i}_${timestamp}.jpg`);
        await fs.writeFile(tempPath, snapshots[i].data);
        tempFiles.push(tempPath);
        snapshots[i].filePath = tempPath;
      }

      const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
      const stream = fsSync.createWriteStream(filepath);
      doc.pipe(stream);

      // TITLE PAGE
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#2563eb').text('URL Shortener', { align: 'center' });
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('Monitoring Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.fontSize(10).text('Powered by Cerebras AI (Llama 3.3 70B)', { align: 'center' });
      doc.moveDown(2);

      // EXECUTIVE SUMMARY
      const boxY = doc.y;
      doc.roundedRect(50, boxY, 495, 280, 10).fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text('Executive Summary', 70, boxY + 20);
      doc.moveDown(0.8);
      doc.fontSize(10).font('Helvetica');
      
      const summaryMetrics = [
        ['Total URLs', metrics.total_urls.value.toFixed(0), '#10b981'],
        ['Creation Rate', `${metrics.urls_shortened_rate.value.toFixed(2)} URLs/sec`, '#3b82f6'],
        ['Redirect Rate', `${metrics.redirect_rate.value.toFixed(2)} req/sec`, '#8b5cf6'],
        ['Error Rate', `${metrics.error_rate.value.toFixed(4)} errors/sec`, '#10b981'],
        ['P50 Latency', `${(metrics.p50_latency.value * 1000).toFixed(2)}ms`, '#f59e0b'],
        ['P95 Latency', `${(metrics.p95_latency.value * 1000).toFixed(2)}ms`, '#10b981'],
        ['P99 Latency', `${(metrics.p99_latency.value * 1000).toFixed(2)}ms`, '#f59e0b'],
        ['Click-Through Rate', `${(metrics.click_through_rate.value * 100).toFixed(2)}%`, '#06b6d4'],
        ['Active Connections', metrics.active_connections.value.toFixed(0), '#8b5cf6'],
        ['Database Size', `${metrics.database_size_mb.value.toFixed(2)} MB`, '#6366f1']
      ];

      let currentY = doc.y;
      summaryMetrics.forEach(([label, value, color], index) => {
        if (index > 0 && index % 2 === 0) {
          currentY += 25;
          doc.y = currentY;
        }
        const xPos = index % 2 === 0 ? 70 : 320;
        doc.fillColor('#374151').text(`${label}:`, xPos, currentY, { continued: true, width: 120 });
        doc.fillColor(color).font('Helvetica-Bold').text(` ${value}`, { width: 120 });
        doc.font('Helvetica');
      });

      // AI ANALYSIS
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e40af').text('🤖 AI-Powered Analysis', { underline: true });
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text('Generated by Cerebras AI using Llama 3.3 70B');
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(analysis, { align: 'justify', lineGap: 5 });

      // DETAILED METRICS
      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af').text('📊 Detailed Metrics', { underline: true });
      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151').text('Cumulative Statistics');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      
      [
        ['Total URLs Shortened', metrics.total_urls_shortened.value.toFixed(0)],
        ['Total Redirects', metrics.total_redirects.value.toFixed(0)],
        ['Total 404 Errors', metrics.total_404s.value.toFixed(0)],
        ['Success Rate', `${((metrics.total_redirects.value / (metrics.total_redirects.value + metrics.total_404s.value)) * 100).toFixed(2)}%`]
      ].forEach(([label, value]) => {
        doc.fillColor('#374151').text(`${label}: `, { continued: true });
        doc.fillColor('#2563eb').font('Helvetica-Bold').text(value);
        doc.font('Helvetica');
      });

      doc.moveDown(1.5);
      if (metrics.top_domains && metrics.top_domains.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151').text('Top 5 Domains');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        metrics.top_domains.forEach((item, index) => {
          doc.fillColor('#374151').text(`${index + 1}. ${item.domain}: `, { continued: true });
          doc.fillColor('#10b981').font('Helvetica-Bold').text(`${item.count} URLs`);
          doc.font('Helvetica');
        });
      }

      // DASHBOARD SNAPSHOTS
      if (snapshots && snapshots.length > 0) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af').text('📈 Dashboard Snapshots', { underline: true });
        doc.moveDown(1);

        for (let i = 0; i < snapshots.length; i++) {
          if (i > 0) doc.addPage();
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151').text(snapshots[i].name, { underline: true });
          doc.moveDown(0.5);
          
          try {
            doc.image(snapshots[i].filePath, { fit: [495, 350], align: 'center' });
            console.log(`✅ Embedded: ${snapshots[i].name}`);
          } catch (err) {
            console.error(`❌ Failed to embed ${snapshots[i].name}:`, err.message);
            doc.fontSize(10).text('[Image could not be embedded]');
          }
        }
      }

      // FOOTER
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
          .text(`Page ${i + 1} of ${range.count} | Generated by AI Report Generator | Powered by Cerebras AI`,
                50, doc.page.height - 50, { align: 'center', width: 495 });
      }

      doc.end();

      stream.on('finish', async () => {
        // Clean up temp files
        for (const tempFile of tempFiles) {
          try {
            await fs.unlink(tempFile);
          } catch (err) {
            console.warn('Failed to delete temp file:', tempFile);
          }
        }
        console.log(`✅ PDF report saved: ${filepath}`);
        resolve({ filename, filepath });
      });

      stream.on('error', async (err) => {
        for (const tempFile of tempFiles) {
          try { await fs.unlink(tempFile); } catch (e) {}
        }
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-reporter',
    ai_provider: 'Cerebras',
    model: 'llama-3.3-70b',
    timestamp: new Date().toISOString(),
    cerebras_api_configured: !!CEREBRAS_API_KEY
  });
});

app.post('/api/reports/generate', async (req, res) => {
  try {
    console.log('🚀 Starting report generation with Cerebras AI...');

    console.log('📊 Fetching Prometheus metrics...');
    const metrics = await fetchPrometheusMetrics();
    console.log('✅ Metrics fetched');

    console.log('📸 Capturing dashboard snapshots...');
    const dashboards = [
      { uid: 'url-shortener-main', name: 'Main Monitoring Dashboard' },
      { uid: 'url-shortener-analytics', name: 'Advanced Analytics Dashboard' },
      { uid: 'url-shortener-system-health', name: 'System Health Dashboard' }
    ];

    const snapshots = [];
    for (const dashboard of dashboards) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Small delay between captures
        const jpegData = await captureDashboardSnapshot(dashboard.uid);
        snapshots.push({ name: dashboard.name, data: jpegData });
        console.log(`✅ Captured: ${dashboard.name}`);
      } catch (err) {
        console.warn(`⚠️ Failed to capture ${dashboard.name}:`, err.message);
      }
    }

    console.log('🤖 Analyzing with Cerebras AI...');
    const analysis = await analyzeWithCerebras(metrics);
    console.log('✅ AI analysis complete');

    console.log('📄 Generating PDF report...');
    const report = await generatePdfReport(analysis, metrics, snapshots);
    console.log('✅ PDF report generated');

    const metricsSimple = {};
    for (const [key, data] of Object.entries(metrics)) {
      if (key !== 'top_domains') metricsSimple[key] = data.value;
    }

    res.json({
      success: true,
      message: 'Report generated successfully with Cerebras AI',
      report: {
        filename: report.filename,
        path: report.filepath,
        generated_at: new Date().toISOString(),
        ai_provider: 'Cerebras',
        model: 'llama-3.3-70b',
        snapshots_included: snapshots.length
      },
      metrics: metricsSimple,
      analysis_preview: analysis.substring(0, 300) + '...'
    });
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const files = await fs.readdir(REPORTS_DIR);
    const reports = files.filter(f => f.endsWith('.pdf'))
      .map(f => ({ filename: f, path: path.join(REPORTS_DIR, f), url: `/api/reports/download/${f}` }))
      .sort((a, b) => b.filename.localeCompare(a.filename));
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.endsWith('.pdf') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const filepath = path.join(REPORTS_DIR, filename);
    await fs.access(filepath);
    res.download(filepath);
  } catch (error) {
    res.status(404).json({ success: false, error: 'Report not found' });
  }
});

app.delete('/api/reports/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.endsWith('.pdf') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    await fs.unlink(path.join(REPORTS_DIR, filename));
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 AI Report Generator running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 AI Provider: Cerebras (Llama 3.3 70B)`);
  console.log(`📸 Dashboard snapshots: ENABLED (using Sharp for image conversion)`);
});