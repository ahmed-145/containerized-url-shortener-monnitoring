FROM node:18-alpine AS base

RUN apk add --no-cache \
    cairo \
    pango \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    imagemagick  # ADD THIS LINE

WORKDIR /app

COPY package*.json ./

RUN npm install --production && \
    npm cache clean --force

COPY report-generator.js ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/reports && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "report-generator.js"]