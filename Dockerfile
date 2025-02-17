FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all application files
COPY . .

# Build the Next.js application
RUN npm run build

# Production container
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only the necessary built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Run Next.js in production mode
CMD ["npm", "run", "start"]
