import { createClient } from 'redis';
const redisClient = createClient({
    url: 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);
export async function saveSessionToRedis(session) {
    await redisClient.set(`session:${session.sessionId}`, JSON.stringify(session));
}
export async function getSessionFromRedis(sessionId) {
    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (!sessionData)
        return null;
    return JSON.parse(sessionData);
}
export const saveTokenToRedis = async (sessionId, role, token) => {
    const key = `token:${sessionId}:${role}`;
    await redisClient.set(key, token, {
        EX: 86400
    });
};
// Get token from Redis
export const getTokenFromRedis = async (sessionId, role) => {
    const key = `token:${sessionId}:${role}`;
    return await redisClient.get(key);
};
