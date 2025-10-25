# ==========================================
# MULTI-STAGE BUILD - OPTIMIZED (BONUS)
# ==========================================

# Stage 1: Base dependencies
FROM node:18-alpine AS base
# Install dependencies for SQLite
RUN apk add --no-cache python3 make g++
WORKDIR /app
# Copy package files
COPY package*.json ./

# Stage 2: Dependencies installation
FROM base AS dependencies
# Install ALL dependencies (including dev)
RUN npm ci

# Stage 3: Production dependencies only
FROM base AS prod-dependencies
# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Stage 4: Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 5: Production build
FROM node:18-alpine AS production
# Install wget for healthcheck only
RUN apk add --no-cache wget

WORKDIR /app

# Copy ONLY production dependencies (smaller image)
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./

# Create directory for database with proper permissions
RUN mkdir -p /app/data

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check with optimized interval
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use node directly for faster startup
CMD ["node", "server.js"]