// API Configuration
const API_URL = window.location.origin;

// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const customCodeInput = document.getElementById('customCode');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const shortUrlText = document.getElementById('shortUrlText');
const originalUrlSpan = document.getElementById('originalUrl');
const shortCodeSpan = document.getElementById('shortCode');
const copyBtn = document.getElementById('copyBtn');
const qrBtn = document.getElementById('qrBtn');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const qrCodeImage = document.getElementById('qrCodeImage');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const urlsList = document.getElementById('urlsList');
const toast = document.getElementById('toast');
const bulkUploadArea = document.getElementById('bulkUploadArea');
const csvFileInput = document.getElementById('csvFileInput');
const bulkResult = document.getElementById('bulkResult');
const successCount = document.getElementById('successCount');
const failedCount = document.getElementById('failedCount');
const totalCount = document.getElementById('totalCount');
const downloadResultBtn = document.getElementById('downloadResultBtn');

// Utility Functions
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Real-time URL validation
let validationTimeout;

urlInput.addEventListener('input', async () => {
  const url = urlInput.value.trim();
  
  // Clear previous timeout
  clearTimeout(validationTimeout);
  
  if (!url) {
    urlInput.style.borderColor = '';
    return;
  }
  
  // Debounce validation (wait 500ms after typing stops)
  validationTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`${API_URL}/api/validate-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        urlInput.style.borderColor = '#10b981'; // Green
        urlInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
      } else {
        urlInput.style.borderColor = '#ef4444'; // Red
        urlInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  }, 500);

  // After URL validation, check if already shortened
const checkResponse = await fetch(`${API_URL}/api/check-existing`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url })
});

const existing = await checkResponse.json();

if (existing.exists) {
  const reuse = confirm(
    `This URL was already shortened as: ${existing.shortUrl}\n\n` +
    `Created: ${existing.createdAt}\n` +
    `Clicks: ${existing.clicks}\n\n` +
    `Do you want to reuse this code instead of creating a new one?`
  );
  
  if (reuse) {
    displayResult({
      success: true,
      shortCode: existing.shortCode,
      shortUrl: existing.shortUrl,
      originalUrl: url
    });
    showToast('Reusing existing short URL!', 'success');
    urlInput.value = '';
    customCodeInput.value = '';
    return;
  }
}
});



function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function truncateUrl(url, maxLength = 50) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

// API Calls
async function shortenUrl(url, customCode = '') {
  const response = await fetch(`${API_URL}/api/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      url, 
      customCode: customCode || undefined 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to shorten URL');
  }

  return response.json();
}

// Bulk Upload Variables
let resultCsvData = null;

// Bulk Upload: Click to browse
bulkUploadArea.addEventListener('click', () => {
  csvFileInput.click();
});

// Bulk Upload: File selected
csvFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await uploadCSV(file);
  }
});

// Bulk Upload: Drag and drop
bulkUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  bulkUploadArea.classList.add('dragover');
});

bulkUploadArea.addEventListener('dragleave', () => {
  bulkUploadArea.classList.remove('dragover');
});

bulkUploadArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  bulkUploadArea.classList.remove('dragover');
  
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    await uploadCSV(file);
  } else {
    showToast('Please upload a CSV file', 'error');
  }
});

// Upload CSV function
async function uploadCSV(file) {
  bulkUploadArea.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
    </svg>
    <p>Processing ${file.name}...</p>
  `;
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/api/bulk-shorten`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to process CSV');
    }
    
    // Get the CSV result
    resultCsvData = await response.text();
    
    // Parse to count successes/failures
    const lines = resultCsvData.split('\n');
    const dataLines = lines.slice(1).filter(line => line.trim()); // Skip header
    
    let success = 0;
    let failed = 0;
    
    dataLines.forEach(line => {
      if (line.includes(',success')) success++;
      else if (line.includes(',failed')) failed++;
    });
    
    // Show results
    successCount.textContent = success;
    failedCount.textContent = failed;
    totalCount.textContent = success + failed;
    bulkResult.classList.remove('hidden');
    
    // Reset upload area
    bulkUploadArea.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p>Drop CSV file here or click to browse</p>
      <small>CSV format: url,code (optional)</small>
      <input type="file" id="csvFileInput" accept=".csv" hidden>
    `;
    
    // Re-attach event listener
    const newFileInput = document.getElementById('csvFileInput');
    newFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await uploadCSV(file);
    });
    
    showToast(`Processed ${success + failed} URLs successfully!`, 'success');
    
    // Refresh URL list
    fetchUrls();
    
  } catch (error) {
    showToast(error.message, 'error');
    
    // Reset upload area on error
    bulkUploadArea.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p>Drop CSV file here or click to browse</p>
      <small>CSV format: url,code (optional)</small>
      <input type="file" id="csvFileInput" accept=".csv" hidden>
    `;
    
    const newFileInput = document.getElementById('csvFileInput');
    newFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await uploadCSV(file);
    });
  }
}

// Download result CSV
downloadResultBtn.addEventListener('click', () => {
  if (!resultCsvData) {
    showToast('No results to download', 'error');
    return;
  }
  
  const blob = new Blob([resultCsvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shortened-urls-${Date.now()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Results downloaded!', 'success');
});

async function fetchUrls() {
  try {
    const response = await fetch(`${API_URL}/api/urls?limit=10`);
    if (!response.ok) throw new Error('Failed to fetch URLs');
    
    const data = await response.json();
    displayUrls(data.urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    urlsList.innerHTML = `
      <div class="empty-state">
        <p>Failed to load URLs. Please try again.</p>
      </div>
    `;
  }
}

// Display Functions
function displayUrls(urls) {
  if (!urls || urls.length === 0) {
    urlsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>No URLs shortened yet. Create your first short link!</p>
      </div>
    `;
    return;
  }

  urlsList.innerHTML = urls.map(url => `
    <div class="url-item">
      <div class="url-info">
        <div class="url-short">
          <a href="/${url.short_code}" target="_blank">
            ${window.location.origin}/${url.short_code}
          </a>
        </div>
        <div class="url-original" title="${url.original_url}">
          ${truncateUrl(url.original_url)}
        </div>
      </div>
      <div class="url-stats">
        <div class="stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          ${url.clicks} clicks
        </div>
        <div class="stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${formatDate(url.created_at)}
        </div>
      </div>
    </div>
  `).join('');
}

function displayResult(data) {
  shortUrlText.value = data.shortUrl;
  originalUrlSpan.textContent = data.originalUrl;
  shortCodeSpan.textContent = data.shortCode;
  resultDiv.classList.remove('hidden');
  
  // Hide QR code when showing new result
  qrCodeContainer.classList.add('hidden');
  
  // Store current short code for QR generation
  qrBtn.dataset.shortCode = data.shortCode;
  
  // Scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event Handlers
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  const customCode = customCodeInput.value.trim();
  
  if (!url) {
    showToast('Please enter a URL', 'error');
    return;
  }
  
  // Validate URL before submitting
  try {
    const validateResponse = await fetch(`${API_URL}/api/validate-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const validation = await validateResponse.json();
    
    if (!validation.valid) {
      showToast(validation.error || 'Invalid URL', 'error');
      urlInput.style.borderColor = '#ef4444';
      return;
    }
  } catch (error) {
    console.error('Validation error:', error);
  }
  
  
  shortenBtn.disabled = true;
  shortenBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
    </svg>
    Shortening...
  `;
  
  try {
    const result = await shortenUrl(url, customCode);
    displayResult(result);
    showToast('URL shortened successfully!', 'success');
    
    // Reset form
    urlInput.value = '';
    customCodeInput.value = '';
    
    // Refresh URL list
    fetchUrls();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
      </svg>
      Shorten URL
    `;
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shortUrlText.value);
    
    copyBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
    
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      `;
    }, 2000);
    
    showToast('Copied to clipboard!', 'success');
  } catch (error) {
    showToast('Failed to copy', 'error');
  }
});

// QR Code button handler
qrBtn.addEventListener('click', async () => {
  const shortCode = qrBtn.dataset.shortCode;
  if (!shortCode) {
    showToast('Please create a short URL first', 'error');
    return;
  }
  
  qrBtn.disabled = true;
  qrBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
    </svg>
    Loading...
  `;
  
  try {
    const response = await fetch(`${API_URL}/api/qr/${shortCode}`);
    if (!response.ok) throw new Error('Failed to generate QR code');
    
    const data = await response.json();
    qrCodeImage.src = data.qrCode;
    qrCodeContainer.classList.remove('hidden');
    
    // Scroll to QR code
    qrCodeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    showToast('QR Code generated!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    qrBtn.disabled = false;
    qrBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      QR Code
    `;
  }
});

// Download QR Code button handler
downloadQrBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `qr-${qrBtn.dataset.shortCode}.png`;
  link.href = qrCodeImage.src;
  link.click();
  showToast('QR Code downloaded!', 'success');
});

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initial load
fetchUrls();