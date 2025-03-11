import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

// Create PubSub instance
const pubsub = new PubSub();
const DETAILS_UPDATED = 'DETAILS_UPDATED';
const EMAIL_ADDED = 'EMAIL_ADDED';

// Store emails and subscribers
const emails = [];
const details = {
  firstName: '',
  lastName: ''
};

// Define the details type
const DetailsType = new GraphQLObjectType({
  name: 'yourDetails',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString }
  }
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'world'
    },
    latestEmail: {
      type: GraphQLString,
      resolve: () => emails[emails.length - 1] || null
    },
    getDetails: {
      type: DetailsType,
      resolve: () => details
    }
  }
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addEmail: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLString }
      },
      resolve: (_, { email }) => {
        emails.push(email);
        pubsub.publish(EMAIL_ADDED, { emailAdded: email });
        return email;
      }
    },
    addDetails: {
      type: DetailsType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString }
      },
      resolve: (_, { firstName, lastName }) => {
        details.firstName = firstName || details.firstName;
        details.lastName = lastName || details.lastName;
        pubsub.publish(DETAILS_UPDATED, { detailsUpdated: {...details} });
        return details;
      }
    },
    updateDetails: {
      type: DetailsType,
      args: {
        key: { type: new GraphQLNonNull(GraphQLString) },
        value: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (_, { key, value }) => {
        if (key in details) {
          details[key] = value;
          pubsub.publish(DETAILS_UPDATED, { detailsUpdated: {...details} });
        }
        return details;
      }
    }
  }
});

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    greetings: {
      type: GraphQLString,
      subscribe: async function* () {
        for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
          yield { greetings: hi };
        }
      }
    },
    emailAdded: {
      type: GraphQLString,
      subscribe: () => pubsub.asyncIterableIterator([EMAIL_ADDED])
    },
    detailsUpdated: {
      type: DetailsType,
      subscribe: () => pubsub.asyncIterableIterator([DETAILS_UPDATED])
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType
});
