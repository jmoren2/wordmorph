# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /home/node/app

# Copy package files and install dependencies
COPY package.json home/node/app
COPY package-lock.json home/node/app


# Copy the rest of the application
COPY . .

RUN npm install --omit=dev

# Build the Next.js app
RUN npm run build

# Expose port 3000 and start Next.js
EXPOSE 3000
CMD ["npm", "run", "dev"]
