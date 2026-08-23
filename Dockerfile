# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend application code
COPY backend/ ./

# Expose port
EXPOSE 5000

# Run database initialization, seed corporate data (one-time), and start server
CMD node scripts/init-db.js && NODE_ENV=production node scripts/seed-one-time.js && npm start
