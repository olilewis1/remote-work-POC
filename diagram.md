    sequenceDiagram
        participant P as Partner
        participant GQL as GraphQL Server
        participant Redis as Redis PubSub
        participant C as Customer

        Note over P,C: Partner Login Flow
        P->>GQL: 1. Login (email/password)
        GQL->>GQL: 2. Validate credentials
        GQL->>P: 3. Return JWT token
        
        Note over P,GQL: Create Session
        P->>GQL: 4. createRemoteSession()
        GQL->>Redis: 5. Create session record
        GQL->>P: 6. Return sessionId
        
        Note over P,GQL: Start Subscription
        P->>GQL: 7. Subscribe to remoteSessionUpdated(sessionId)
        GQL->>Redis: 8. Create subscription channel
        
        Note over P,C: Customer Joins
        C->>GQL: 9. Join with session code
        GQL->>GQL: 10. Validate session code
        GQL->>Redis: 11. Add customer to session
        
        Note over C,GQL: Customer Subscribe
        C->>GQL: 12. Subscribe to remoteSessionUpdated(sessionId)
        GQL->>Redis: 13. Add to subscription channel
        
        Note over P,C: Session Active
        GQL->>P: 14. Notify customer joined
        GQL->>C: 15. Send initial session state
        
        Note over P,C: Real-time Updates
        P->>GQL: 16. updateFormState() mutation
        GQL->>Redis: 17. Publish update
        Redis->>GQL: 18. Broadcast to subscribers
        GQL->>C: 19. Send update to customer