FROM node:latest AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies excluding development dependencies
RUN npm install --omit=dev

# Copy all project files into the container
COPY . .

# Build the project for production
RUN npm run build

FROM nginx:alpine

# Copy the build output from the builder stage to Nginx's web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
