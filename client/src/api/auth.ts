import { ApiClient } from './client';
import { User } from '../types';

class AuthAPI extends ApiClient {
    async register(userData: {
        name: string;
        email: string;
        login: string;
        phone: string;
        password: string;
    }): Promise<{ user: User }> {
        return this.post('/auth/register', userData);
    }

    async login(login: string, password: string): Promise<{ user: User }> {
        return this.post('/auth/login', { login, password });
    }

    async logout(): Promise<{ message: string }> {
        return this.post('/auth/logout', {});
    }

    async getCurrentUser(): Promise<{ user: User }> {
        return this.get('/auth/me');
    }
}

export const authAPI = new AuthAPI();