FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY ShortLink/package.json ./
COPY ShortLink/package-lock.json ./

# Install dependencies excluding development dependencies
RUN npm run install:prod

# Copy all project files into the container
COPY ./ShortLink/ ./

# Build the project for production
RUN npm run build

FROM nginx:alpine

# Copy the build output from the builder stage to Nginx's web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
