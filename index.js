import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
const SECRET_KEY = 'your-secret-key';
const pubsub = new PubSub();
const DETAILS_UPDATED = 'DETAILS_UPDATED';
const typeDefs = `#graphql
type yourDetails { 
    firstName: String
    lastName: String
    email: String
    password: String
}

type AuthPayload {
    token: String!
    user: yourDetails!
}

type Query {
    details: yourDetails 
}

type Mutation {
    addDetails(firstName: String, lastName: String): yourDetails
    updateDetails(key: String, value: String): yourDetails
    signup(email: String, password: String, firstName: String, lastName: String): AuthPayload
    login(email: String, password: String): AuthPayload
}

type Subscription {
    detailsUpdated: yourDetails
}
`;
const yourDetails = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password"
};
const resolvers = {
    Query: {
        details: (_, __, context) => {
            if (!context.user)
                throw new Error('Not authenticated');
            return context.user;
        }
    },
    Mutation: {
        updateDetails: (_, { key, value }, context) => {
            if (!context.user)
                throw new Error('Not Authenticated');
            if (yourDetails[key] === undefined) {
                throw new Error('Invalid key');
            }
            yourDetails[key] = value;
            pubsub.publish(DETAILS_UPDATED, { detailsUpdated: yourDetails });
            return yourDetails;
        },
        signup: async (_, { email, password, firstName, lastName }) => {
            const token = jwt.sign({ email, firstName, lastName }, SECRET_KEY);
            return {
                token,
                user: { email, firstName, lastName }
            };
        },
        login: async (_, { email, password }) => {
            const token = jwt.sign({ email }, SECRET_KEY);
            return {
                token,
                user: yourDetails
            };
        },
    },
    Subscription: {
        detailsUpdated: {
            subscribe: () => pubsub.asyncIterator([DETAILS_UPDATED])
        }
    }
};
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
const serverCleanup = useServer({
    schema,
    context: async (ctx) => {
        // Add WebSocket context here if needed
        return {};
    }
}, wsServer);
const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});
const getUser = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
async function startServer() {
    await server.start();
    app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            if (token) {
                const user = getUser(token);
                return { user, token };
            }
            return {};
        },
    }));
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}
startServer().catch(console.error);
