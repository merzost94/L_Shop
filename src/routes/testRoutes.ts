import { Router } from 'express';
import { readJSONFile, writeJSONFile } from '../utils/fileUtils';
import { Product } from '../types/product';

const router = Router();

router.get('/test/products', async (req, res) => {
    try {
        const products = await readJSONFile<Product>('products.json');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read products' });
    }
});

export default router;