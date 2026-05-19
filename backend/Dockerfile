# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

# # Production stage
# FROM node:22-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package*.json ./
# RUN npm install --omit=dev
# EXPOSE 5000
# ENV NODE_ENV=production
# CMD ["node", "dist/index.js"]
