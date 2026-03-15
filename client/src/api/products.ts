import { ApiClient } from './client';
import { Product, ProductQueryParams } from '../types';

class ProductsAPI extends ApiClient {
    async getProducts(params?: ProductQueryParams): Promise<{ total: number; products: Product[] }> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return this.get(endpoint);
    }

    async getProductById(id: string): Promise<Product> {
        return this.get(`/products/${id}`);
    }

    async getCategories(): Promise<string[]> {
        return this.get('/products/categories');
    }
}

export const productsAPI = new ProductsAPI();