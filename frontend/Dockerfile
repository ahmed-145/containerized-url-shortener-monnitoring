# Use nginx for serving static files
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend files
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx_custom && \
    adduser -S nginx_custom -u 1001

# Set proper permissions
RUN chown -R nginx_custom:nginx_custom /usr/share/nginx/html && \
    chown -R nginx_custom:nginx_custom /var/cache/nginx && \
    chown -R nginx_custom:nginx_custom /var/log/nginx && \
    chown -R nginx_custom:nginx_custom /etc/nginx/conf.d

# Create necessary directories and set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx_custom:nginx_custom /var/run/nginx.pid

USER nginx_custom

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]