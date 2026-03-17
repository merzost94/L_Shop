import { Product } from '../types';
import { cartAPI } from '../api/cart';
import { state, updateState } from '../main';

export function ProductCard(product: Product): string {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <h3 class="product-title" data-title>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price" data-price>${product.price.toLocaleString()} BYN</div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" 
                        ${!product.inStock ? 'disabled' : ''}
                        data-product-id="${product.id}">
                    ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                </button>
            </div>
        </div>
    `;
}

export function initProductCards() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const button = e.target as HTMLButtonElement;
            const productId = button.dataset.productId;
            
            if (!productId) return;

            if (!state.isAuthenticated) {
                alert('Для добавления в корзину необходимо авторизоваться');
                window.location.href = '/auth';
                return;
            }

            try {
                button.disabled = true;
                button.textContent = 'Добавление...';
                
                await cartAPI.addToCart(productId, 1);
                await updateState();
                
                button.textContent = 'Добавлено!';
                setTimeout(() => {
                    button.textContent = 'В корзину';
                    button.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Failed to add to cart:', error);
                alert('Ошибка при добавлении в корзину');
                button.textContent = 'В корзину';
                button.disabled = false;
            }
        });
    });
}