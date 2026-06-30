FROM mcr.microsoft.com/playwright:v1.61.1-jammy

# Set production environment
ENV NODE_ENV=production

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (skipping devDependencies like nodemon)
RUN npm ci 

# Copy application source code
COPY . .

EXPOSE 5000

# Start server
CMD ["npm", "start"]
