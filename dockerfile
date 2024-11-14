FROM golang:1.23-alpine

WORKDIR /app

RUN go install github.com/air-verse/air@v1.52.3

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o shortlink ./app/main.go

CMD ["air", "-c", ".air.toml"]

EXPOSE 3000