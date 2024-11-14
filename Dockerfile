# Build Go App
FROM golang:1.23-alpine

# Set Work Directory in Container
WORKDIR /app

# Copy Go modules and install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Install Auto Reload
RUN go install github.com/air-verse/air@v1.52.3

# Copy rest of the app code
COPY . .

# Build App
RUN go build -o shortlink

# Auto Reload
CMD ["air", "-c", ".air.toml"]

# Expose port
EXPOSE 3000