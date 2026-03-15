type Route = {
    path: string;
    component: () => Promise<string> | string;
    title?: string;
};

class Router {
    private routes: Route[] = [];
    private currentPath: string = '';

    constructor() {
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, false);
        });
    }

    addRoute(path: string, component: () => Promise<string> | string, title?: string): Router {
        this.routes.push({ path, component, title });
        return this;
    }

    async navigate(path: string, pushState: boolean = true): Promise<void> {
        this.currentPath = path;
        
        const route = this.routes.find(r => r.path === path) || 
                     this.routes.find(r => r.path === '*');
        
        if (!route) {
            console.error('Route not found:', path);
            return;
        }

        if (route.title) {
            document.title = route.title;
        }

        const component = await route.component();
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = component;
        }

        if (pushState) {
            history.pushState({}, '', path);
        }
    }

    init(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const path = link.href.replace(window.location.origin, '');
                this.navigate(path);
            }
        });

        this.navigate(window.location.pathname, false);
    }

    getQueryParams(): Record<string, string> {
        const params: Record<string, string> = {};
        const queryString = window.location.search;
        
        if (queryString) {
            const pairs = queryString.substring(1).split('&');
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value);
            });
        }
        
        return params;
    }
}

export const router = new Router();