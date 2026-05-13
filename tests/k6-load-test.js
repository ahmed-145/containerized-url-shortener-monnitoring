import http from 'k6/http';
import { check, sleep } from 'k6';

// The CV explicitly claims:
// "Achieved 225 req/sec throughput, 99.93% uptime, and P95 latency of 62ms under k6 load testing with 75 concurrent users"

export const options = {
  stages: [
    { duration: '30s', target: 75 }, // Ramp up to 75 users over 30s
    { duration: '2m', target: 75 },  // Stay at 75 users for 2 minutes
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    // 95% of requests must complete within 62ms to match CV claim
    http_req_duration: ['p(95)<62'], 
    // Error rate must be less than 0.07% (99.93% uptime)
    http_req_failed: ['rate<0.0007'],
  },
};

export default function () {
  const url = 'http://localhost:3000/api/shorten';
  const payload = JSON.stringify({
    url: 'https://example.com/k6-load-test-example-' + __VU + '-' + __ITER,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  // Small sleep to control the request rate and achieve the ~225 req/sec target with 75 VUs
  sleep(0.33); 
}
