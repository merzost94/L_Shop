import { ApiClient } from './client';
import { CartWithDetails } from '../types';

class CartAPI extends ApiClient {
    async getCart(): Promise<CartWithDetails> {
        return this.get('/cart');
    }

    async addToCart(productId: string, quantity: number = 1): Promise<{ message: string }> {
        return this.post('/cart/items', { productId, quantity });
    }

    async updateCartItem(productId: string, quantity: number): Promise<{ message: string }> {
        return this.put(`/cart/items/${productId}`, { quantity });
    }

    async removeFromCart(productId: string): Promise<{ message: string }> {
        return this.delete(`/cart/items/${productId}`);
    }

    async clearCart(): Promise<{ message: string }> {
        return this.delete('/cart');
    }

    async checkAuth(): Promise<boolean> {
        try {
            await this.get('/auth/me');
            return true;
        } catch {
            return false;
        }
    }
}

export const cartAPI = new CartAPI();