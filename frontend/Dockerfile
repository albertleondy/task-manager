ARG BUILDER_IMAGE=node:20-alpine
ARG RUNTIME_IMAGE=nginx:alpine

# ==========================================
# Build Stage: Compile Vite / React App
# ==========================================
FROM ${BUILDER_IMAGE} AS builder

WORKDIR /app

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Copy project source files
COPY . .

# Set API base URL to relative /api for production reverse proxy
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build production bundle
RUN npm run build

# ==========================================
# Production Stage: Lightweight Nginx Server
# ==========================================
FROM ${RUNTIME_IMAGE}

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check (every 30s)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
