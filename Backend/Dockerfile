FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the API port
EXPOSE 3001

# Default command (overridden in docker-compose for the worker)
CMD ["npm", "start"]
