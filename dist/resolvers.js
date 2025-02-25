import { getSessionFromRedis, saveSessionToRedis, saveTokenToRedis } from './redis.js';
import { PubSub, withFilter } from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import { ParticipantRole } from './types.js';
import { yourDetails, sessions, forms } from './data.js';
import { FORM_UPDATED, DETAILS_UPDATED, JOINED_SESSION } from './subscriptionTypes.js';
const pubsub = new PubSub();
const SECRET_KEY = 'your-secret-key';
const resolvers = {
    Query: {
        details: (_, __, context) => {
            console.log(context);
            if (!context.user)
                throw new Error('Not authenticated');
            return context.user;
        },
        viewSession: async (_, { sessionId }) => {
            const session = await getSessionFromRedis(sessionId);
            if (!session)
                throw new Error('Session not found');
            return session;
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
        signup: async (_, { email, password, firstName, lastName, role }) => {
            const token = jwt.sign({ email, firstName, lastName, role }, SECRET_KEY);
            return {
                token,
                user: { email, firstName, lastName }
            };
        },
        login: async (_, { sessionId, role, email }, context) => {
            const token = jwt.sign({
                sessionId,
                role: role,
                timestamp: new Date().toISOString()
            }, SECRET_KEY, { expiresIn: '24h' });
            await saveTokenToRedis(sessionId, role, token);
            return {
                token,
                user: { email }
            };
        },
        createSession: async (_, { sessionId, sessionType }) => {
            const newSession = {
                sessionId,
                sesssionType: sessionType,
                whoIsInControl: ParticipantRole.PARTNER,
                participants: [{ role: ParticipantRole.PARTNER }],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                page: 1,
                pages: forms
            };
            await saveSessionToRedis(newSession);
            return newSession;
        },
        updateSessionControl: async (_, { sessionId }, context) => {
            const session = sessions.find(s => s.sessionId === sessionId);
            console.log(sessions);
            if (!context.user)
                throw new Error('Not authenticated');
            if (!session)
                throw new Error('Session not found');
            console.log(context.user.role, session.whoIsInControl, 'context.user.role, session.whoIsInControl');
            if (session.whoIsInControl === context.user.role)
                throw new Error('Already set');
            session.whoIsInControl = context.user.role;
            session.updatedAt = new Date().toISOString();
            await saveSessionToRedis(session);
            pubsub.publish('SESSION_CONTROL_UPDATED', { sessionControlUpdated: session });
            return session;
        },
        joinSession: async (_, { sessionId, customerType }) => {
            const session = sessions.find(s => s.sessionId === sessionId);
            if (!session)
                throw new Error('Session not found');
            console.log(session);
            if (session.participants.some(p => p.role === customerType))
                throw new Error('Already joined');
            const token = jwt.sign({
                sessionId,
                role: customerType,
                timestamp: new Date().toISOString()
            }, SECRET_KEY, { expiresIn: '24h' });
            await saveTokenToRedis(sessionId, customerType, token);
            session.participants.push({ role: customerType });
            session.updatedAt = new Date().toISOString();
            session.whoIsInControl = customerType;
            await saveSessionToRedis(session);
            pubsub.publish(JOINED_SESSION, { joinedSession: session });
            return {
                session: session,
                token: token
            };
        },
        updateForm: async (_, { sessionId, key, value, form }, context) => {
            const session = await getSessionFromRedis(sessionId);
            if (!session)
                throw new Error('Session not found');
            if (!context.user)
                throw new Error('Not authenticated');
            console.log('sessiob', session.whoIsInControl, context.user.role);
            if (session.whoIsInControl !== context.user.role)
                throw new Error('Not authorized');
            if (form === 'yourDetails') {
                session.pages.yourDetails = {
                    ...session.pages.yourDetails,
                    [key]: value
                };
            }
            else if (form === 'addressForm') {
                session.pages.addressForm = {
                    ...session.pages.addressForm,
                    [key]: typeof value === 'string' ? value : Boolean(value)
                };
            }
            session.updatedAt = new Date().toISOString();
            await saveSessionToRedis(session);
            // Optionally publish update
            pubsub.publish('FORM_UPDATED', { formUpdated: session });
            return session;
        },
        updatePageScroll: async (_, { sessionId, page, scrollPosition }) => {
            const session = sessions.find(s => s.sessionId === sessionId);
            if (!session)
                throw new Error('Session not found');
            const scrollUpdate = {
                sessionId,
                page,
                scrollPosition
            };
            // Publish the scroll update
            pubsub.publish('PAGE_SCROLL_UPDATED', { pageScrollUpdated: scrollUpdate });
            return scrollUpdate;
        }
    },
    Subscription: {
        detailsUpdated: {
            subscribe: () => pubsub.asyncIterableIterator([DETAILS_UPDATED])
        },
        joinedSession: {
            subscribe: () => pubsub.asyncIterableIterator([JOINED_SESSION])
        },
        formUpdated: {
            subscribe: () => pubsub.asyncIterableIterator([FORM_UPDATED])
        },
        pageScrollUpdated: {
            subscribe: withFilter(() => pubsub.asyncIterableIterator(['PAGE_SCROLL_UPDATED']), (payload, variables) => {
                return payload.pageScrollUpdated.sessionId === variables.sessionId;
            })
        },
        sessionControlUpdated: {
            subscribe: withFilter(() => pubsub.asyncIterableIterator(['SESSION_CONTROL_UPDATED']), (payload, variables) => {
                return payload.sessionControlUpdated.sessionId === variables.sessionId;
            })
        }
    }
};
export default resolvers;
