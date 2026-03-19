export interface User {
    id: string;
    name: string;
    email: string;
    login: string;
    phone: string;
    password?: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
}

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

export interface ProductQueryParams {
    search?: string;
    category?: string;
    inStock?: string;
    sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    total?: number;
}
