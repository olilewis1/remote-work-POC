import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

// Use createHttpLink instead of HttpLink
const httpLink = createHttpLink({
    uri: 'http://localhost:4000/graphql'
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    console.log('Token in authLink:', token); // Debug log
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ""
        }
    };
});

// Create the authenticated http link first
const authenticatedHttpLink = authLink.concat(httpLink);

const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:4000/graphql',
    retryAttempts: 5,
    connectionParams: () => {
        const token = localStorage.getItem('token');
        console.log('WS connecting with token:', token);
        return {
            authorization: token
        };
    },
    shouldRetry: () => true,
    retryWait: () => new Promise((resolve) => setTimeout(resolve, 1000))
}));

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        const isSubscription = definition.kind === 'OperationDefinition' && 
                             definition.operation === 'subscription';
        console.log('Operation type:', definition.operation); // Debug log
        return isSubscription;
    },
    wsLink,
    authenticatedHttpLink  // Use the pre-concatenated link
);

export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only'
        },
        mutate: {
            fetchPolicy: 'network-only'
        }
    }
});