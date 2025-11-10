# Multi-Channel Alerting Setup - Slack Integration

## Overview

This document provides step-by-step instructions for setting up Slack notifications for Grafana alerts.

---

## 1. Create Slack Incoming Webhook

### Step 1: Access Slack App Directory
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "URL Shortener Alerts"
4. Select your workspace

### Step 2: Enable Incoming Webhooks
1. Click "Incoming Webhooks" in left sidebar
2. Toggle "Activate Incoming Webhooks" to ON
3. Click "Add New Webhook to Workspace"
4. Select channel (e.g., #alerts or #monitoring)
5. Click "Allow"

### Step 3: Copy Webhook URL
```
Example: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

Save this URL - you'll need it for Grafana configuration.

---

## 2. Configure Grafana Contact Point

### Method 1: Via Grafana UI

1. Open Grafana: http://localhost:3001
2. Login (admin/admin)
3. Go to: **Alerting** → **Contact points**
4. Click "New contact point"
5. Fill in:
   - **Name:** Slack Alerts
   - **Integration:** Slack
   - **Webhook URL:** (paste your webhook URL)
   - **Title:** `{{ .CommonAnnotations.summary }}`
   - **Text:** 
     ```
     *Alert: {{ .CommonLabels.alertname }}*
     
     {{ range .Alerts }}
     *Status:* {{ .Status }}
     *Description:* {{ .Annotations.description }}
     {{ end }}
     
     <http://localhost:3001/alerting/list|View in Grafana>
     ```
6. Click "Test" to verify
7. Click "Save contact point"

### Method 2: Via Configuration File

Create file: `grafana/provisioning/alerting/contact_points.yml`

```yaml
apiVersion: 1

contactPoints:
  - orgId: 1
    name: Slack Alerts
    receivers:
      - uid: slack_alerts
        type: slack
        settings:
          url: YOUR_WEBHOOK_URL_HERE
          title: '{{ .CommonAnnotations.summary }}'
          text: |-
            *Alert: {{ .CommonLabels.alertname }}*
            
            {{ range .Alerts }}
            *Status:* {{ .Status }}
            *Severity:* {{ .Labels.severity }}
            *Description:* {{ .Annotations.description }}
            {{ end }}
            
            <http://localhost:3001/alerting/list|View in Grafana>
          username: URL Shortener Bot
          icon_emoji: ':warning:'
```

---

## 3. Update Alert Rules to Use Slack

Update `grafana/provisioning/alerting/alert_rules.yml`:

```yaml
apiVersion: 1

groups:
  - orgId: 1
    name: URL Shortener Alerts
    folder: Alerts
    interval: 1m
    rules:
      - uid: high_latency_alert
        title: High Request Latency
        condition: A
        data:
          - refId: A
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: prometheus
            model:
              expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.1
              refId: A
        noDataState: NoData
        execErrState: Error
        for: 2m
        annotations:
          description: 'P95 latency is {{ $value }}s (threshold: 0.1s)'
          summary: Request latency is above 100ms for more than 2 minutes
        labels:
          severity: warning
          service: url-shortener
        # ADD THIS SECTION
        notificationSettings:
          receiver: Slack Alerts
      
      - uid: high_404_rate_alert
        title: Elevated 404 Error Rate
        condition: A
        data:
          - refId: A
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: prometheus
            model:
              expr: rate(failed_lookups_total[5m]) / (rate(successful_redirects_total[5m]) + rate(failed_lookups_total[5m])) > 0.05
              refId: A
        noDataState: NoData
        execErrState: Error
        for: 2m
        annotations:
          description: '404 error rate is {{ $value | humanizePercentage }} (threshold: 5%)'
          summary: Failed URL lookups exceed 5% of total requests for more than 2 minutes
        labels:
          severity: warning
          service: url-shortener
        # ADD THIS SECTION
        notificationSettings:
          receiver: Slack Alerts
```

---

## 4. Test Slack Notifications

### Test 1: Manual Test from Grafana
```bash
# 1. Go to Grafana → Alerting → Contact points
# 2. Find "Slack Alerts"
# 3. Click "Test"
# 4. Check Slack channel for test message
```

### Test 2: Trigger Real Alert
```bash
# Generate high latency
for i in {1..200}; do
  curl -X POST http://localhost:3000/test/simulate-latency \
    -H "Content-Type: application/json" \
    -d '{"duration": 500}' &
done

# Wait 3-4 minutes, check Slack for alert
```

---

## 5. Advanced: Multiple Channels

### Setup Different Channels for Different Alerts

#### Slack Channels:
- `#alerts-critical` - For critical alerts
- `#alerts-warning` - For warnings
- `#monitoring` - For info/resolved notifications

#### Create Multiple Contact Points:

**File:** `grafana/provisioning/alerting/contact_points.yml`

```yaml
apiVersion: 1

contactPoints:
  # Critical alerts channel
  - orgId: 1
    name: Slack Critical
    receivers:
      - uid: slack_critical
        type: slack
        settings:
          url: https://hooks.slack.com/services/YOUR/CRITICAL/WEBHOOK
          title: '🔴 CRITICAL: {{ .CommonAnnotations.summary }}'
          text: |-
            @channel *CRITICAL ALERT*
            
            *Alert:* {{ .CommonLabels.alertname }}
            {{ range .Alerts }}
            *Description:* {{ .Annotations.description }}
            {{ end }}
          username: Alert Bot
          icon_emoji: ':rotating_light:'
  
  # Warning alerts channel
  - orgId: 1
    name: Slack Warnings
    receivers:
      - uid: slack_warnings
        type: slack
        settings:
          url: https://hooks.slack.com/services/YOUR/WARNING/WEBHOOK
          title: '⚠️ Warning: {{ .CommonAnnotations.summary }}'
          text: |-
            *Alert:* {{ .CommonLabels.alertname }}
            {{ range .Alerts }}
            *Description:* {{ .Annotations.description }}
            {{ end }}
          username: Alert Bot
          icon_emoji: ':warning:'
  
  # Monitoring/info channel
  - orgId: 1
    name: Slack Monitoring
    receivers:
      - uid: slack_monitoring
        type: slack
        settings:
          url: https://hooks.slack.com/services/YOUR/MONITORING/WEBHOOK
          title: 'ℹ️ {{ .CommonAnnotations.summary }}'
          text: |-
            {{ range .Alerts }}
            *Status:* {{ .Status }}
            *Info:* {{ .Annotations.description }}
            {{ end }}
          username: Monitoring Bot
          icon_emoji: ':chart_with_upwards_trend:'
```

---

## 6. Email Notifications (Bonus)

### Setup SMTP in Grafana

Update `docker-compose.yml`:

```yaml
grafana:
  image: grafana/grafana:latest
  environment:
    # ... existing env vars ...
    
    # SMTP Configuration
    - GF_SMTP_ENABLED=true
    - GF_SMTP_HOST=smtp.gmail.com:587
    - GF_SMTP_USER=your-email@gmail.com
    - GF_SMTP_PASSWORD=your-app-password
    - GF_SMTP_FROM_ADDRESS=alerts@yourcompany.com
    - GF_SMTP_FROM_NAME=URL Shortener Alerts
```

### Create Email Contact Point

```yaml
# grafana/provisioning/alerting/contact_points.yml
contactPoints:
  - orgId: 1
    name: Email Alerts
    receivers:
      - uid: email_alerts
        type: email
        settings:
          addresses: 'devops@example.com;oncall@example.com'
          singleEmail: false
```

---

## 7. Discord Webhook (Alternative)

### Discord Setup

1. Go to Discord Server Settings → Integrations
2. Create Webhook
3. Copy webhook URL

### Grafana Configuration

```yaml
contactPoints:
  - orgId: 1
    name: Discord Alerts
    receivers:
      - uid: discord_alerts
        type: discord
        settings:
          url: YOUR_DISCORD_WEBHOOK_URL
          title: '{{ .CommonAnnotations.summary }}'
          message: |-
            **Alert: {{ .CommonLabels.alertname }}**
            
            {{ range .Alerts }}
            Status: {{ .Status }}
            Description: {{ .Annotations.description }}
            {{ end }}
          avatar_url: 'https://grafana.com/static/img/grafana_icon.svg'
          use_discord_username: false
```

---

## 8. Notification Policies

### Route Alerts Based on Severity

**File:** `grafana/provisioning/alerting/notification_policies.yml`

```yaml
apiVersion: 1

policies:
  - orgId: 1
    receiver: Slack Warnings  # Default receiver
    group_by:
      - alertname
      - severity
    group_wait: 10s
    group_interval: 5m
    repeat_interval: 4h
    
    routes:
      # Critical alerts - immediate Slack + Email
      - receiver: Slack Critical
        matchers:
          - severity = critical
        continue: true
        group_wait: 0s
        repeat_interval: 30m
      
      - receiver: Email Alerts
        matchers:
          - severity = critical
        group_wait: 0s
        repeat_interval: 1h
      
      # Warning alerts - Slack only
      - receiver: Slack Warnings
        matchers:
          - severity = warning
        group_wait: 30s
        repeat_interval: 2h
      
      # Info alerts - monitoring channel
      - receiver: Slack Monitoring
        matchers:
          - severity = info
        group_wait: 5m
        repeat_interval: 12h
```

---

## 9. Testing Checklist

- [ ] Slack webhook created and URL saved
- [ ] Contact point configured in Grafana
- [ ] Test message sent successfully
- [ ] Alert rules updated with notification settings
- [ ] Real alert triggered and received in Slack
- [ ] Alert resolved notification received
- [ ] Multiple channels tested (if applicable)
- [ ] Notification timing verified (not too frequent)

---

## 10. Monitoring Alert Health

### Check Alert Status
```bash
# Via Grafana API
curl -u admin:admin http://localhost:3001/api/alert-notifications

# Via Prometheus
curl http://localhost:9090/api/v1/rules?type=alert
```

### Common Issues

**Issue: Slack messages not arriving**
```
Solution:
1. Check webhook URL is correct
2. Test webhook manually:
   curl -X POST WEBHOOK_URL \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test message"}'
3. Check Grafana logs:
   docker compose logs grafana | grep -i slack
```

**Issue: Alerts not triggering**
```
Solution:
1. Verify alert rules are loaded
2. Check Prometheus is scraping metrics
3. Verify alert conditions are met
4. Check "for" duration hasn't exceeded
```

---

## 11. Best Practices

### Do's:
✅ Use descriptive channel names
✅ Test alerts regularly
✅ Document webhook URLs securely
✅ Set reasonable repeat intervals
✅ Use @channel sparingly (critical only)
✅ Include links to dashboards in messages

### Don'ts:
❌ Don't commit webhook URLs to git
❌ Don't set repeat interval too short (spam)
❌ Don't use same channel for all severities
❌ Don't forget to test alert resolution notifications

---

## 12. Environment Variables Method

Instead of hardcoding webhooks, use environment variables:

```yaml
# docker-compose.yml
grafana:
  environment:
    - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
```

```bash
# .env file (don't commit!)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

```yaml
# grafana/provisioning/alerting/contact_points.yml
contactPoints:
  - orgId: 1
    name: Slack Alerts
    receivers:
      - uid: slack_alerts
        type: slack
        settings:
          url: $SLACK_WEBHOOK_URL
```

---

## 13. Example Slack Messages

### Alert Firing:
```
🔴 ALERT FIRING

*Alert:* High Request Latency
*Status:* firing
*Severity:* warning
*Description:* P95 latency is 0.523s (threshold: 0.1s)

[View in Grafana]
```

### Alert Resolved:
```
✅ ALERT RESOLVED

*Alert:* High Request Latency
*Status:* resolved
*Duration:* 8 minutes

System has returned to normal.

[View in Grafana]
```

---

**Setup Complete!** 🎉

Your alerts will now be sent to Slack in real-time.

For support: Check Grafana docs at https://grafana.com/docs/grafana/latest/alerting/