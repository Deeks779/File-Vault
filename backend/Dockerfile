#For Render (takes small space)
# Stage 1: Build Go binary
FROM golang:1.25.1-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server .

# Stage 2: Final image
FROM alpine:latest
WORKDIR /app

# Copy the built server
COPY --from=builder /server /server

# Copy migrations folder
COPY internal/db /app/db

# Install psql (needed to run SQL migrations)
RUN apk add --no-cache postgresql-client bash

EXPOSE 8080

# Run migrations before starting server
ENTRYPOINT [ "sh", "-c", "for f in /app/db/*.sql; do psql $DATABASE_URL -f $f; done && /server" ]

#For Local Host(takes large space)
# FROM golang:1.25.1

# WORKDIR /app

# COPY go.mod go.sum ./
# RUN go mod download

# COPY . .

# EXPOSE 8080
# CMD ["go", "run", "main.go"]