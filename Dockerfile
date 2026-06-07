FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production

# Copy source and build
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

# Cleanup
RUN rm -rf src tsconfig.json

# Create auth_info directory for persistent mounts
RUN mkdir -p auth_info

EXPOSE 3001

CMD ["node", "dist/index.js"]
