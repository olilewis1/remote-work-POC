# GraphQL SSE Example with PubSub

This is a GraphQL Server implementation using Server-Sent Events (SSE) with PubSub for real-time updates. It demonstrates how to handle both regular GraphQL operations and subscriptions over a single HTTP connection.

## Architecture

- **Server**: Node.js HTTP server with GraphQL and SSE
- **Transport**: Server-Sent Events (SSE) for real-time updates
- **Event System**: PubSub for managing subscriptions and updates
- **Endpoint**: Single `/graphql` endpoint for all operations

## Dependencies

```json
{
  "dependencies": {
    "graphql": "^16.8.1",
    "graphql-sse": "^2.5.4",
    "graphql-subscriptions": "^2.0.0"
  }
}
```

## Installation

```bash
npm install
```

## Running the Server

```bash
node server.js
```

Server runs at `http://localhost:4000/graphql`

## Testing the API

### 1. Start a Subscription
Open a terminal and run:
```bash
curl -N -H "accept:text/event-stream" -H "content-type:application/json" -d '{
  "query": "subscription { detailsUpdated { firstName lastName } }"
}' http://localhost:4000/graphql
```

### 2. Add Details (in another terminal)
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "query": "mutation { addDetails(firstName: \"John\", lastName: \"Doe\") { firstName lastName } }"
}' http://localhost:4000/graphql
```

## How It Works

### Server-Side Implementation

1. **Connection Handling**
   - Single HTTP connection stays open for subscriptions
   - Uses SSE protocol for real-time updates
   - No polling required

2. **PubSub System**
   - Manages event publishing and subscription
   - Handles multiple subscribers efficiently
   - Provides real-time updates

3. **GraphQL Operations**
   - Queries: Regular HTTP POST requests
   - Mutations: Trigger PubSub events
   - Subscriptions: Long-lived SSE connections

### Example Flow

1. Client establishes SSE connection
```
Client ─────────────────► Server
        SSE Connection
```

2. Server sends updates when data changes
```
Server ─────────────────► Client
   event: next
   data: {"data":{"detailsUpdated":{"firstName":"John"}}}
```

3. Connection remains open for future updates
```
Server ◄─────────────────► Client
     Persistent Connection
```

## Available Operations

### Queries
```graphql
query {
  getDetails {
    firstName
    lastName
  }
}
```

### Mutations
```graphql
mutation {
  addDetails(firstName: String, lastName: String)
  updateDetails(key: String!, value: String!)
}
```

### Subscriptions
```graphql
subscription {
  detailsUpdated {
    firstName
    lastName
  }
}
```



## Error Handling

- Connection errors are automatically handled by SSE
- Failed mutations return GraphQL errors
- Subscriptions automatically reconnect on failure