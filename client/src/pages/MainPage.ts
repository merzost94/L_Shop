import { productsAPI } from '../api/products';
import { ProductCard, initProductCards } from '../components/ProductCard';
import { Filters, FilterState, initFilters } from '../components/Filters';
import { router } from '../utils/router';
import { html } from '../utils/html';

let currentFilters: FilterState = {
    search: '',
    category: '',
    inStock: '',
    sort: undefined
};

export async function renderMainPage(): Promise<string> {
    try {
        const queryParams = router.getQueryParams();
        currentFilters = {
            search: queryParams.search || '',
            category: queryParams.category || '',
            inStock: queryParams.inStock || '',
            sort: (queryParams.sort as FilterState['sort']) || undefined
        };

        const response = await productsAPI.getProducts(currentFilters);
        
        const filtersHtml = await Filters(currentFilters, () => {});

        const productsHtml = response.products.length > 0 
            ? response.products.map(ProductCard).join('')
            : '<p class="no-products">Товары не найдены</p>';

        return html`
            <h1>Каталог товаров</h1>
            <p class="products-count">Найдено товаров: ${response.total}</p>
            
            ${filtersHtml}
            
            <div class="products-grid">
                ${productsHtml}
            </div>
        `;
    } catch (error) {
        console.error('Failed to render main page:', error);
        return '<h1>Ошибка загрузки товаров</h1>';
    }
}

async function handleFilterChange(newFilters: FilterState) {
    currentFilters = newFilters;

    const queryParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
        }
    });
    
    const newUrl = queryParams.toString() ? `/?${queryParams.toString()}` : '/';
    history.pushState({}, '', newUrl);
    
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = await renderMainPage();
        initMainPage();
    }
}

export function initMainPage() {
    initFilters(handleFilterChange);
    initProductCards();
}