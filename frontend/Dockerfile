# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built frontend files
# Vite uses /dist, CRA uses /build
COPY --from=build /app/dist /usr/share/nginx/html

# Expose internal port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
