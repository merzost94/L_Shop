import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileUtils';
import { User } from '../types/user';
import { Session } from '../types/session';

const COOKIE_MAX_AGE = 600000;

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, login, phone, password } = req.body;

        if (!name || !email || !login || !phone || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const users = await readJSONFile<User>('users.json');

        const existingUser = users.find(u => u.login === login || u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
        }

        const newUser: User = {
            id: uuidv4(),
            name,
            email,
            login,
            phone,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeJSONFile('users.json', users);

        const sessionId = uuidv4();
        const sessions = await readJSONFile<Session>('sessions.json');
        
        const newSession: Session = {
            sessionId,
            userId: newUser.id,
            expiresAt: Date.now() + COOKIE_MAX_AGE
        };
        
        sessions.push(newSession);
        await writeJSONFile('sessions.json', sessions);

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            maxAge: COOKIE_MAX_AGE,
            sameSite: 'lax'
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }

        const users = await readJSONFile<User>('users.json');
        
        const user = users.find(u => (u.login === login || u.email === login) && u.password === password);
        
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const sessionId = uuidv4();
        const sessions = await readJSONFile<Session>('sessions.json');

        const filteredSessions = sessions.filter(s => s.userId !== user.id);
        
        const newSession: Session = {
            sessionId,
            userId: user.id,
            expiresAt: Date.now() + COOKIE_MAX_AGE
        };
        
        filteredSessions.push(newSession);
        await writeJSONFile('sessions.json', filteredSessions);

        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            maxAge: COOKIE_MAX_AGE,
            sameSite: 'lax'
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (sessionId) {
            const sessions = await readJSONFile<Session>('sessions.json');
            const filteredSessions = sessions.filter(s => s.sessionId !== sessionId);
            await writeJSONFile('sessions.json', filteredSessions);
        }

        res.clearCookie('sessionId');
        res.json({ message: 'Успешный выход' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Ошибка при выходе' });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (!sessionId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const sessions = await readJSONFile<Session>('sessions.json');
        const session = sessions.find(s => s.sessionId === sessionId);

        if (!session || session.expiresAt < Date.now()) {
            res.clearCookie('sessionId');
            return res.status(401).json({ error: 'Сессия истекла' });
        }

        const users = await readJSONFile<User>('users.json');
        const user = users.find(u => u.id === session.userId);

        if (!user) {
            res.clearCookie('sessionId');
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Ошибка при получении пользователя' });
    }
};