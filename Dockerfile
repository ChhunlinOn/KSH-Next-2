# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build the Next.js app for production
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# Install only production dependencies
RUN npm ci --only=production

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "start"]