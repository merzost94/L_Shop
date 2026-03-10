import { Request, Response, NextFunction } from 'express';
import { readJSONFile } from '../utils/fileUtils';
import { Session } from '../types/session';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.cookies.sessionId;

        if (!sessionId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const sessions = await readJSONFile<Session>('sessions.json');
        const session = sessions.find(s => s.sessionId === sessionId);

        if (!session || session.expiresAt < Date.now()) {
            res.clearCookie('sessionId');
            return res.status(401).json({ error: 'Сессия истекла' });
        }

        req.userId = session.userId;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
};