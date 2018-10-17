# nats-streaming-clients

Proof of concept for nats streaming for work

### Prerequisites

* Docker
* Node

## Deployment

* Install dependencies with `npm install`
* Build with `npm run build`
* Start nats-streaming cluster with `npm run docker:up`
* Start publisher with `npm run start:pub <id>`
* Start subscriber with `npm run start:sub <id>`