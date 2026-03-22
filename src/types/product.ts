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

export interface ProductQueryParams {
    search?: string;
    category?: string;
    inStock?: string;
    sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}