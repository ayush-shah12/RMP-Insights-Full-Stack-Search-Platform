APP=ratemyprof

.PHONY: run build test lint

run:
	go run ./cmd/server

build:
	go build -o $(APP) ./cmd/server

test:
	go test ./...
