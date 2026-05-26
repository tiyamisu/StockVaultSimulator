
# justfile — StockVault Simulator development commands
# Install 'just': https://github.com/casey/just#installation
# Usage: just <recipe>

# Export all variables as shell env vars
set export

# Load .env file for private keys / local overrides
set dotenv-load

# Project root directory
CWDIR := justfile_directory()

# Default: list all available recipes
_default:
    @just -f {{justfile()}} --list

# Build the Java backend JAR and rebuild Docker images
build:
    #!/bin/bash
    set -ex -o pipefail

    pushd stock-market-service
    mvn clean package -DskipTests
    popd

    docker-compose down
    docker-compose build

# Start all services via Docker Compose
start:
    docker-compose up

# Start services and rebuild images
start-build:
    docker-compose up --build

# Run backend locally with H2 in-memory DB (no Docker needed)
dev-backend:
    #!/bin/bash
    set -ex -o pipefail
    cd stock-market-service
    mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run the React frontend dev server
dev-frontend:
    #!/bin/bash
    set -ex -o pipefail
    cd frontend
    npm install
    npm run dev

# Run all Java tests
test:
    #!/bin/bash
    set -ex -o pipefail
    cd stock-market-service
    mvn test

# Tear down all Docker containers and volumes
down:
    docker-compose down -v

# Clean Maven build artifacts
clean:
    #!/bin/bash
    cd stock-market-service
    mvn clean