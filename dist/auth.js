import jwt from 'jsonwebtoken';
const SECRET_KEY = 'your-secret-key';
export const getUser = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log(decoded, 'decoded');
        return decoded;
    }
    catch (error) {
        return null;
    }
};
