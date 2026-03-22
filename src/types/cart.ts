import { Product } from './product';

export interface CartItem {
    productId: string;
    quantity: number;

}

export interface Cart {
    userId: string;
    items: CartItem[];
    updatedAt: string;
}

export interface CartWithDetails {
    userId: string;
    items: (CartItem & { product: Product })[];
    totalPrice: number;
    totalItems: number;
    updatedAt: string;
}