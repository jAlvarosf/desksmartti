# Build stage for React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage for Node.js Express backend + serving static frontend
FROM node:20-alpine
WORKDIR /app

# Install OpenSSL and libc dependencies required by Prisma engine on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copy backend dependencies definition
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma Client specifically inside Alpine Linux environment
RUN npx prisma generate

# Copy backend source code
COPY backend/src ./src

# Copy built frontend from builder stage into public directory
COPY --from=frontend-builder /app/frontend/dist ./public

# Create directory for uploads & data persistence
RUN mkdir -p uploads prisma/data

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./data/desksmart.db"

# Start script to run DB migrations/seed and start backend
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
