import { Request, Response } from 'express';
import { readJSONFile, writeJSONFile } from '../utils/fileUtils';
import { Product, ProductQueryParams } from '../types/product';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await readJSONFile<Product>('products.json');
        
        const {
            search,
            category,
            inStock,
            sort
        } = req.query as ProductQueryParams;

        let filteredProducts = [...products];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        if (category) {
            filteredProducts = filteredProducts.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (inStock !== undefined) {
            const inStockBool = inStock === 'true';
            filteredProducts = filteredProducts.filter(p => p.inStock === inStockBool);
        }

        if (sort) {
            switch (sort) {
                case 'price_asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name_asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name_desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
        }

        res.json({
            total: filteredProducts.length,
            products: filteredProducts
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const products = await readJSONFile<Product>('products.json');
        
        const product = products.find(p => p.id === id);
        
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        res.json(product);

    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ error: 'Ошибка при получении товара' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, inStock} = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Название, описание, цена и категория обязательны' });
        }

        const products = await readJSONFile<Product>('products.json');
        
        const newProduct: Product = {
            id: uuidv4(),
            name,
            description,
            price: Number(price),
            category,
            inStock: inStock ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        products.push(newProduct);
        await writeJSONFile('products.json', products);

        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Ошибка при создании товара' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, inStock, image } = req.body;

        const products = await readJSONFile<Product>('products.json');
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const updatedProduct = {
            ...products[productIndex],
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price: Number(price) }),
            ...(category && { category }),
            ...(inStock !== undefined && { inStock }),
            updatedAt: new Date().toISOString()
        };

        products[productIndex] = updatedProduct;
        await writeJSONFile('products.json', products);

        res.json(updatedProduct);

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Ошибка при обновлении товара' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const products = await readJSONFile<Product>('products.json');
        
        const filteredProducts = products.filter(p => p.id !== id);
        
        if (filteredProducts.length === products.length) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        await writeJSONFile('products.json', filteredProducts);
        res.json({ message: 'Товар успешно удален' });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Ошибка при удалении товара' });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const products = await readJSONFile<Product>('products.json');
        const categories = [...new Set(products.map(p => p.category))];
        
        res.json(categories);

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Ошибка при получении категорий' });
    }
};