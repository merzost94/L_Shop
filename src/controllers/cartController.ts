import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { readJSONFile, writeJSONFile } from '../utils/fileUtils';
import { Cart, CartItem, CartWithDetails } from '../types/cart';
import { Product } from '../types/product';

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const carts = await readJSONFile<Cart>('carts.json');
        const products = await readJSONFile<Product>('products.json');
        
        let cart = carts.find(c => c.userId === userId);
        
        if (!cart) {
            cart = {
                userId,
                items: [],
                updatedAt: new Date().toISOString()
            };
            carts.push(cart);
            await writeJSONFile('carts.json', carts);
        }

        const cartWithDetails: CartWithDetails = {
            userId: cart.userId,
            items: cart.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    ...item,
                    product: product || {
                        id: item.productId,
                        name: 'Товар удален',
                        description: '',
                        price: 0,
                        category: '',
                        inStock: false,
                        createdAt: '',
                        updatedAt: ''
                    }
                };
            }),
            totalPrice: cart.items.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (product?.price || 0) * item.quantity;
            }, 0),
            totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            updatedAt: cart.updatedAt
        };

        res.json(cartWithDetails);

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Ошибка при получении корзины' });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'ID товара обязателен' });
        }

        const products = await readJSONFile<Product>('products.json');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        if (!product.inStock) {
            return res.status(400).json({ error: 'Товара нет в наличии' });
        }

        const carts = await readJSONFile<Cart>('carts.json');
        let cartIndex = carts.findIndex(c => c.userId === userId);

        if (cartIndex === -1) {
            const newCart: Cart = {
                userId,
                items: [{ productId, quantity: Number(quantity) }],
                updatedAt: new Date().toISOString()
            };
            carts.push(newCart);
            await writeJSONFile('carts.json', carts);
            
            return res.status(201).json({ message: 'Товар добавлен в корзину' });
        }

        const cart = carts[cartIndex];
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            cart.items.push({ productId, quantity: Number(quantity) });
        } else {
            cart.items[itemIndex].quantity += Number(quantity);
        }

        cart.updatedAt = new Date().toISOString();
        carts[cartIndex] = cart;
        
        await writeJSONFile('carts.json', carts);
        res.json({ message: 'Товар добавлен в корзину' });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Ошибка при добавлении в корзину' });
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Количество должно быть больше 0' });
        }

        const carts = await readJSONFile<Cart>('carts.json');
        const cartIndex = carts.findIndex(c => c.userId === userId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        const cart = carts[cartIndex];
        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден в корзине' });
        }

        cart.items[itemIndex].quantity = Number(quantity);
        cart.updatedAt = new Date().toISOString();
        
        carts[cartIndex] = cart;
        await writeJSONFile('carts.json', carts);

        res.json({ message: 'Количество обновлено' });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ error: 'Ошибка при обновлении корзины' });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const { productId } = req.params;

        const carts = await readJSONFile<Cart>('carts.json');
        const cartIndex = carts.findIndex(c => c.userId === userId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        const cart = carts[cartIndex];
        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.updatedAt = new Date().toISOString();
        
        carts[cartIndex] = cart;
        await writeJSONFile('carts.json', carts);

        res.json({ message: 'Товар удален из корзины' });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Ошибка при удалении из корзины' });
    }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const carts = await readJSONFile<Cart>('carts.json');
        const cartIndex = carts.findIndex(c => c.userId === userId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        carts[cartIndex].items = [];
        carts[cartIndex].updatedAt = new Date().toISOString();
        
        await writeJSONFile('carts.json', carts);
        res.json({ message: 'Корзина очищена' });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Ошибка при очистке корзины' });
    }
};