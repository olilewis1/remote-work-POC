import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getUser } from './auth.js';
import resolvers from './resolvers.js';
import typeDefs from './typeDefs.js';
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
async function startServer() {
    await server.start();
    app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization?.replace('Bearer ', '') || '';
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
