import jwt from 'jsonwebtoken';
import { Details } from './types.js';
const SECRET_KEY = 'your-secret-key';


export const getUser = (token: string): any => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log(decoded, 'decoded');
        return decoded;
    } catch (error) {
        return null;
    }
};

