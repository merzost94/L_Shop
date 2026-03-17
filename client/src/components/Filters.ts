import { productsAPI } from '../api/products';
import { ProductQueryParams } from '../types';

export interface FilterState {
    search: string;
    category: string;
    inStock: string;
    sort: ProductQueryParams['sort'];
}

export async function Filters(activeFilters: FilterState, onFilterChange: (filters: FilterState) => void): Promise<string> {
    let categories: string[] = [];
    try {
        categories = await productsAPI.getCategories();
    } catch (error) {
        console.error('Failed to load categories:', error);
    }

    return `
        <div class="filters">
            <div class="filter-group">
                <input type="text" 
                       class="filter-search" 
                       placeholder="Поиск товаров..." 
                       value="${activeFilters.search || ''}"
                       id="search-input">
            </div>

            <div class="filter-group">
                <select class="filter-category" id="category-select">
                    <option value="">Все категории</option>
                    ${categories.map(cat => `
                        <option value="${cat}" ${activeFilters.category === cat ? 'selected' : ''}>
                            ${cat}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div class="filter-group">
                <select class="filter-stock" id="stock-select">
                    <option value="">Все товары</option>
                    <option value="true" ${activeFilters.inStock === 'true' ? 'selected' : ''}>
                        В наличии
                    </option>
                    <option value="false" ${activeFilters.inStock === 'false' ? 'selected' : ''}>
                        Нет в наличии
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <select class="filter-sort" id="sort-select">
                    <option value="">Без сортировки</option>
                    <option value="price_asc" ${activeFilters.sort === 'price_asc' ? 'selected' : ''}>
                        Цена (по возрастанию)
                    </option>
                    <option value="price_desc" ${activeFilters.sort === 'price_desc' ? 'selected' : ''}>
                        Цена (по убыванию)
                    </option>
                    <option value="name_asc" ${activeFilters.sort === 'name_asc' ? 'selected' : ''}>
                        Название (А-Я)
                    </option>
                    <option value="name_desc" ${activeFilters.sort === 'name_desc' ? 'selected' : ''}>
                        Название (Я-А)
                    </option>
                </select>
            </div>
        </div>
    `;
}

export function initFilters(onFilterChange: (filters: FilterState) => void) {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
    const stockSelect = document.getElementById('stock-select') as HTMLSelectElement;
    const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;

    const applyFilters = () => {
        const filters: FilterState = {
            search: searchInput?.value || '',
            category: categorySelect?.value || '',
            inStock: stockSelect?.value || '',
          
            
            sort: (sortSelect?.value as FilterState['sort']) || undefined
        };
        onFilterChange(filters);
    };

    if (searchInput) {
        let timeout: NodeJS.Timeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(applyFilters, 500);
        });
    }

    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
    if (stockSelect) stockSelect.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
}