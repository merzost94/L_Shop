import { cartAPI } from '../api/cart';
import { updateState, state } from '../main';
import { html } from '../utils/html';
import { router } from '../utils/router';

export async function renderCartPage(): Promise<string> {
    try {
        if (!state.isAuthenticated) {
            return html`
                <div class="cart-empty">
                    <h2>Корзина пуста</h2>
                    <p>Чтобы увидеть корзину, <a href="/auth">войдите</a> в аккаунт</p>
                </div>
            `;
        }

        const cart = await cartAPI.getCart();

        if (cart.items.length === 0) {
            return html`
                <div class="cart-empty">
                    <h2>Корзина пуста</h2>
                    <p>Перейдите в <a href="/">каталог</a>, чтобы добавить товары</p>
                </div>
            `;
        }

        return html`
            <h1>Корзина</h1>
            
            <div class="cart-items">
                ${cart.items.map(item => `
                    <div class="cart-item" data-product-id="${item.productId}">
                        <div class="cart-item-info">
                            <h3 class="cart-item-title" data-title="basket">${item.product.name}</h3>
                            <p class="cart-item-price" data-price="basket">
                                ${item.product.price.toLocaleString()} BYN
                            </p>
                        </div>

                        <div class="cart-item-quantity">
                            <button class="btn-quantity decrease" data-product-id="${item.productId}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="btn-quantity increase" data-product-id="${item.productId}">+</button>
                        </div>

                        <div class="cart-item-total">
                            ${(item.product.price * item.quantity).toLocaleString()} BYN
                        </div>

                        <button class="btn-remove" data-product-id="${item.productId}">×</button>
                    </div>
                `).join('')}
            </div>

            <div class="cart-summary">
                <div class="cart-total">
                    <span>Итого:</span>
                    <span class="total-price">${cart.totalPrice.toLocaleString()} BYN</span>
                </div>
                <div class="cart-total-items">
                    <span>Товаров:</span>
                    <span>${cart.totalItems} шт.</span>
                </div>
                
                <button class="btn btn-primary btn-checkout" id="checkout-btn">
                    Оформить заказ
                </button>
                
                <button class="btn btn-secondary btn-clear" id="clear-cart-btn">
                    Очистить корзину
                </button>
            </div>
        `;
    } catch (error) {
        return '<h1>Ошибка загрузки корзины</h1>';
    }
}

async function refreshCart() {
    await updateState();
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = await renderCartPage();
        setTimeout(() => {
            initCartPage();
        }, 0);
    }
}

export function initCartPage() {
    
    document.querySelectorAll('.increase').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target as HTMLButtonElement;
            const productId = button.dataset.productId;
            const cartItem = button.closest('.cart-item');
            const quantitySpan = cartItem?.querySelector('.quantity');
            
            if (!productId || !quantitySpan) return;
            
            const currentQuantity = parseInt(quantitySpan.textContent || '1');
            try {
                button.disabled = true;
                await cartAPI.updateCartItem(productId, currentQuantity + 1);
                await refreshCart();
            } catch (error) {
                alert('Ошибка при обновлении количества');
                button.disabled = false;
            }
        });
    });

    document.querySelectorAll('.decrease').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target as HTMLButtonElement;
            const productId = button.dataset.productId;
            const cartItem = button.closest('.cart-item');
            const quantitySpan = cartItem?.querySelector('.quantity');
                        
            if (!productId || !quantitySpan) return;
            
            const currentQuantity = parseInt(quantitySpan.textContent || '1');
            if (currentQuantity <= 1) return;
            
            try {
                button.disabled = true;
                await cartAPI.updateCartItem(productId, currentQuantity - 1);
                await refreshCart();
            } catch (error) {
                alert('Ошибка при обновлении количества');
                button.disabled = false;
            }
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target as HTMLButtonElement;
            const productId = button.dataset.productId;
                        
            if (!productId) return;
            
            if (confirm('Удалить товар из корзины?')) {
                try {
                    button.disabled = true;
                    await cartAPI.removeFromCart(productId);
                    await refreshCart();
                } catch (error) {
                    alert('Ошибка при удалении товара');
                    button.disabled = false;
                }
            }
        });
    });

    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        const newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode?.replaceChild(newClearBtn, clearBtn);
        
        newClearBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm('Очистить корзину?')) {
                try {
                    (newClearBtn as HTMLButtonElement).disabled = true;
                    await cartAPI.clearCart();
                    await refreshCart();
                } catch (error) {
                    alert('Ошибка при очистке корзины');
                    (newClearBtn as HTMLButtonElement).disabled = false;
                }
            }
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        const newCheckoutBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode?.replaceChild(newCheckoutBtn, checkoutBtn);
        
        newCheckoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                (newCheckoutBtn as HTMLButtonElement).disabled = true;
                (newCheckoutBtn as HTMLButtonElement).textContent = 'Оформляем...';
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await cartAPI.clearCart();
                await updateState();
                
                alert(' Заказ успешно оформлен! Спасибо за покупку!');
                
                router.navigate('/');
                
            } catch (error) {
                alert('Ошибка при оформлении заказа');
                (newCheckoutBtn as HTMLButtonElement).disabled = false;
                (newCheckoutBtn as HTMLButtonElement).textContent = 'Оформить заказ';
            }
        });
    }
}