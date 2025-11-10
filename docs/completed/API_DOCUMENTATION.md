# URL Shortener API Documentation

## Base URL
```
http://localhost:3000
```

## Table of Contents
- [Authentication](#authentication)
- [URL Shortening Endpoints](#url-shortening-endpoints)
- [Management Endpoints](#management-endpoints)
- [Monitoring Endpoints](#monitoring-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## URL Shortening Endpoints

### 1. Shorten URL
Create a shortened URL from a long URL.

**Endpoint:** `POST /api/shorten`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://www.example.com/very/long/url/path",
  "customCode": "mycode" // Optional: Custom short code (3-20 chars, alphanumeric)
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://www.example.com/very/long/url/path",
  "createdAt": "2025-11-08T12:00:00.000Z"
}
```

**Error Responses:**

400 Bad Request - Missing URL:
```json
{
  "success": false,
  "error": "URL is required"
}
```

400 Bad Request - Invalid URL:
```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

409 Conflict - Custom code already exists:
```json
{
  "success": false,
  "error": "Custom code already exists"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.github.com"}'
```

---

### 2. Redirect to Original URL
Access a shortened URL and get redirected to the original URL.

**Endpoint:** `GET /:code`

**Parameters:**
- `code` (path parameter): The short code generated during URL creation

**Success Response (302 Found):**
- Redirects to the original URL
- Increments click counter for the URL

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "URL not found"
}
```

**Browser Example:**
```
http://localhost:3000/abc123
```

**cURL Example:**
```bash
curl -L http://localhost:3000/abc123
```

---

### 3. Bulk Shorten URLs
Shorten multiple URLs at once via CSV upload.

**Endpoint:** `POST /api/bulk-shorten`

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: CSV file with column named "url"

**CSV Format:**
```csv
url
https://example.com/page1
https://example.com/page2
https://example.com/page3
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "originalUrl": "https://example.com/page1",
      "shortCode": "abc123",
      "shortUrl": "http://localhost:3000/abc123"
    },
    {
      "originalUrl": "https://example.com/page2",
      "shortCode": "def456",
      "shortUrl": "http://localhost:3000/def456"
    }
  ],
  "total": 2
}
```

---

## Management Endpoints

### 4. List All URLs
Retrieve a paginated list of all shortened URLs.

**Endpoint:** `GET /api/urls`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)

**Success Response (200 OK):**
```json
{
  "success": true,
  "urls": [
    {
      "id": 1,
      "code": "abc123",
      "originalUrl": "https://www.example.com",
      "clicks": 15,
      "createdAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/urls?page=1&limit=20"
```

---

### 5. Get URL Statistics
Retrieve detailed statistics for a specific shortened URL.

**Endpoint:** `GET /api/stats/:code`

**Parameters:**
- `code` (path parameter): The short code

**Success Response (200 OK):**
```json
{
  "success": true,
  "code": "abc123",
  "originalUrl": "https://www.example.com",
  "clicks": 42,
  "createdAt": "2025-11-08T10:00:00.000Z",
  "lastAccessedAt": "2025-11-08T12:30:00.000Z",
  "domain": "example.com"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "URL not found"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/stats/abc123
```

---

### 6. Delete URL
Delete a shortened URL from the system.

**Endpoint:** `DELETE /api/urls/:code`

**Parameters:**
- `code` (path parameter): The short code to delete

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "URL deleted successfully",
  "code": "abc123"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "URL not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/urls/abc123
```

---

### 7. Generate QR Code
Generate a QR code image for a shortened URL.

**Endpoint:** `GET /api/qr/:code`

**Parameters:**
- `code` (path parameter): The short code

**Success Response (200 OK):**
- Content-Type: `image/png`
- Returns PNG image of QR code

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "URL not found"
}
```

**Browser Example:**
```
http://localhost:3000/api/qr/abc123
```

---

## Monitoring Endpoints

### 8. Prometheus Metrics
Export metrics in Prometheus format for monitoring.

**Endpoint:** `GET /metrics`

**Success Response (200 OK):**
```
# HELP urls_shortened_total Total number of URLs shortened
# TYPE urls_shortened_total counter
urls_shortened_total 150

# HELP successful_redirects_total Total successful redirects
# TYPE successful_redirects_total counter
successful_redirects_total 420

# HELP failed_lookups_total Total failed URL lookups
# TYPE failed_lookups_total counter
failed_lookups_total 12

# HELP http_request_duration_seconds Request latency histogram
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 300
http_request_duration_seconds_bucket{le="0.01"} 380
http_request_duration_seconds_bucket{le="0.025"} 410
```

**cURL Example:**
```bash
curl http://localhost:3000/metrics
```

---

### 9. JSON Metrics
Get current metrics in JSON format for integrations.

**Endpoint:** `GET /api/metrics/json`

**Success Response (200 OK):**
```json
{
  "totalUrlsShortened": 150,
  "successfulRedirects": 420,
  "failedLookups": 12,
  "totalUrlsInDatabase": 150,
  "clickThroughRate": 2.8,
  "databaseSizeBytes": 24576,
  "activeConnections": 3,
  "topDomains": [
    { "domain": "github.com", "count": 45 },
    { "domain": "stackoverflow.com", "count": 32 }
  ],
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/metrics/json
```

---

### 10. Health Check
Check if the service is running and healthy.

**Endpoint:** `GET /health`

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T12:00:00.000Z",
  "database": "connected",
  "uptime": 3600
}
```

**cURL Example:**
```bash
curl http://localhost:3000/health
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 302 | Found - Redirect to original URL |
| 400 | Bad Request - Invalid input data |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing rate limiting to prevent abuse.

**Recommended Limits:**
- URL Shortening: 100 requests per hour per IP
- URL Access: 1000 requests per hour per IP
- Bulk Operations: 10 requests per hour per IP

---

## Best Practices

### URL Validation
- Only HTTP and HTTPS protocols are accepted
- URLs must be valid and well-formed
- Maximum URL length: 2048 characters

### Custom Short Codes
- Length: 3-20 characters
- Allowed characters: alphanumeric (a-z, A-Z, 0-9)
- Case-sensitive
- Must be unique

### Performance Tips
1. Use bulk shortening for multiple URLs
2. Cache frequently accessed URLs
3. Monitor metrics regularly
4. Set appropriate page limits when listing URLs

---

## Examples

### Complete Workflow Example

```bash
# 1. Shorten a URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/ahmed-145/url-shortener"}'

# Response: {"success":true,"shortCode":"a1b2c3","shortUrl":"http://localhost:3000/a1b2c3"}

# 2. Access the shortened URL
curl -L http://localhost:3000/a1b2c3
# Redirects to: https://github.com/ahmed-145/url-shortener

# 3. Check statistics
curl http://localhost:3000/api/stats/a1b2c3
# Response: {"success":true,"clicks":1,"createdAt":"..."}

# 4. View all URLs
curl http://localhost:3000/api/urls?limit=10

# 5. Generate QR code (save to file)
curl http://localhost:3000/api/qr/a1b2c3 -o qrcode.png

# 6. Delete URL
curl -X DELETE http://localhost:3000/api/urls/a1b2c3
```

---

## Support

For issues or questions:
- Check service logs: `docker compose logs backend`
- Verify service health: `curl http://localhost:3000/health`
- Review Prometheus metrics: `http://localhost:9090`
- Check Grafana dashboards: `http://localhost:3001`

---

**Last Updated:** November 8, 2025  
**API Version:** 1.0  
**Base URL:** http://localhost:3000