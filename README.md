# GraphQL Subscriptions Demo

This project demonstrates real-time form synchronization between a customer and partner view using GraphQL subscriptions.

## Prerequisites

- Node.js and npm installed
- Redis server installed and running locally

## Installation & Setup

1. Install server dependencies:
```bash
npm install
npm run start
```

2. Install client dependencies:
```bash
cd client
npm install
npm start
```

## Running the Demo

1. Open two different browsers to `http://localhost:3000`

2. Set up the Partner view:
   - Open GraphQL Playground at `http://localhost:4000/graphql`
   - Run the Partner login mutation:
   ```graphql
   mutation Mutation($sessionId: String!, $role: ParticipantRole!, $email: String!) {
     login(sessionId: $sessionId, role: $role, email: $email) {
       token
       user {
         firstName
       }
     }
   }
   ```
   With variables:
   ```json
   {
     "sessionId": "1",
     "role": "PARTNER",
     "email": "john@example.com"
   }
   ```
   - Copy the returned token
   - In the first browser, set the token in headers: 
   token: value from above

3. Set up the Customer view:
   - In GraphQL Playground, run the Customer join mutation:
   ```graphql
   mutation JoinSession($sessionId: String, $customerType: ParticipantRole) {
     joinSession(sessionId: $sessionId, customerType: $customerType) {
       token
       session {
         participants {
           role
         }
       }
     }
   }
   ```
   With variables:
   ```json
   {
     "sessionId": "1",
     "customerType": "CUSTOMER"
   }
   ```
   - Copy the returned token
   - In the second browser, set the token in headers: 
   token: value from above
Will need to refresh both browsers to see the changes
## Testing the Real-time Features

1. In the Customer view (browser with Customer token):
   - Update the postcode field
   - Scroll the page
   - update password and see it only sends characters not any sensitive data
   
2. In the Partner view (browser with Partner token):
   - Watch the form update in real-time
   - See the page scroll position sync automatically
   - Can ask for access and change who is in control

## Features

- Real-time form synchronization
- Scroll position synchronization
- Role-based access control (Customer can edit, Partner can only view)
- WebSocket-based subscriptions
- JWT authentication

## Technical Implementation

The demo uses:
- GraphQL Subscriptions for real-time updates
- Redis for pub/sub functionality
- JWT for authentication
- React for the frontend
- Apollo Client for GraphQL operations
- WebSocket for subscription transport
