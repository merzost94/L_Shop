import { router } from './utils/router';
import { authAPI } from './api/auth';
import { cartAPI } from './api/cart';
import { initMainPage } from './pages/MainPage';
import { initAuthPage } from './pages/AuthPage';
import { initCartPage } from './pages/CartPage';
import { User } from './types';
import './styles/main.css';

export interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    cartItemsCount: number;
}

export const state: AppState = {
    user: null,
    isAuthenticated: false,
    cartItemsCount: 0
};

export async function updateState() {
    try {
        const isAuth = await cartAPI.checkAuth().catch(() => false);
        state.isAuthenticated = isAuth;
        
        if (isAuth) {
            try {
                const userData = await authAPI.getCurrentUser();
                state.user = userData.user;
                
                const cart = await cartAPI.getCart();
                state.cartItemsCount = cart.totalItems;
            } catch (error) {
                state.isAuthenticated = false;
                state.user = null;
                state.cartItemsCount = 0;
            }
        } else {
            state.user = null;
            state.cartItemsCount = 0;
        }
        
        updateUI();
    } catch (error) {
        state.isAuthenticated = false;
        state.user = null;
        state.cartItemsCount = 0;
        updateUI();
    }
}

function updateUI() {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.textContent = state.cartItemsCount.toString();
    }
    
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(el => {
        if (state.isAuthenticated) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    
    const nonAuthElements = document.querySelectorAll('.non-auth');
    nonAuthElements.forEach(el => {
        if (!state.isAuthenticated) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

async function initApp() {
    await updateState();

    router
        .addRoute('/', async () => {
            const { renderMainPage } = await import('./pages/MainPage');
            const html = await renderMainPage();
            setTimeout(() => initMainPage(), 50);
            return html;
        }, 'Главная')
        .addRoute('/auth', async () => {
            const { renderAuthPage } = await import('./pages/AuthPage');
            const html = renderAuthPage();
            setTimeout(() => initAuthPage(), 50);
            return html;
        }, 'Вход / Регистрация')
        .addRoute('/cart', async () => {
            const { renderCartPage } = await import('./pages/CartPage');
            const html = await renderCartPage();
            setTimeout(() => {
                initCartPage();
            }, 50);
            return html;
        }, 'Корзина')
        .addRoute('*', () => '<h1>404 - Страница не найдена</h1>');

    router.init();

    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await authAPI.logout();
            await updateState();
            router.navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);