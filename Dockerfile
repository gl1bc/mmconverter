# Multi-stage build for optimized production image

# Stage 1: Build dependencies
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Production image
FROM node:22-bookworm-slim

# Install dumb-init and Playwright system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    npx -y playwright@1.58.1 install-deps chromium && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs -m

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs public ./public

# Switch to nodejs user
USER nodejs

# Install Playwright browsers as nodejs user (browser binaries only, no system deps)
RUN npx playwright install chromium

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "src/server/server.js"]
