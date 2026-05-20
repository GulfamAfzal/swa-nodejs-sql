FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only-production
COPY . .
 
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3001
CMD ["node", "src/index.js"]