FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

# Build step is omitted for dev, but we can just run next dev for this docker-compose setup
# For production we'd do: RUN npm run build && CMD ["npm", "start"]
# Here we will just run dev to make it simpler and ensure HMR if needed
EXPOSE 3000
CMD ["npm", "run", "dev"]
