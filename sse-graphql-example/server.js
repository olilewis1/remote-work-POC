import http from 'http';
import { createHandler } from 'graphql-sse/lib/use/http';
import { schema } from './schema.js';
import { graphql } from 'graphql';

// Create the GraphQL over SSE handler
const handler = createHandler({ schema });

const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!req.url.startsWith('/graphql')) {
    res.writeHead(404).end();
    return;
  }

  // Handle SSE subscriptions
  if (req.headers.accept?.includes('text/event-stream')) {
    return handler(req, res);
  }

  // Handle regular queries and mutations
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { query } = JSON.parse(body);
        const result = await graphql({ schema, source: query });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: error.message }] }));
      }
    });
    return;
  }

  res.writeHead(405).end('Method not allowed');
});

server.listen(4000, () => {
  console.log(' Server ready at:');
  console.log('- Queries and Subscriptions: http://localhost:4000/graphql');
});