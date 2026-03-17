import { authAPI } from '../api/auth';
import { updateState } from '../main';
import { router } from '../utils/router';
import { html } from '../utils/html';

let isLoginMode = true;

export function renderAuthPage(): string {
    return html`
        <div class="auth-container">
            <div class="auth-tabs">
                <button class="auth-tab ${isLoginMode ? 'active' : ''}" data-auth-tab="login">Вход</button>
                <button class="auth-tab ${!isLoginMode ? 'active' : ''}" data-auth-tab="register">Регистрация</button>
            </div>

            <form class="auth-form" data-registration id="auth-form">
                ${!isLoginMode ? `
                    <div class="form-group">
                        <label for="name">Имя</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label for="login">Логин или Email</label>
                    <input type="text" id="login" name="login" required>
                </div>

                <div class="form-group">
                    <label for="password">Пароль</label>
                    <input type="password" id="password" name="password" required>
                </div>

                ${!isLoginMode ? `
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="phone">Телефон</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                ` : ''}

                <button type="submit" class="btn btn-primary btn-block">
                    ${isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    `;
}

export function initAuthPage() {
    document.querySelectorAll('[data-auth-tab="login"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = true;
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = renderAuthPage();
                initAuthPage();
            }
        });
    });

    document.querySelectorAll('[data-auth-tab="register"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = false;
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = renderAuthPage();
                initAuthPage();
            }
        });
    });

    const form = document.getElementById('auth-form') as HTMLFormElement;
    if (form) {
        const newForm = form.cloneNode(true) as HTMLFormElement;
        form.parentNode?.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(newForm);
            const submitBtn = newForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Загрузка...';

                if (isLoginMode) {
                    const login = formData.get('login') as string;
                    const password = formData.get('password') as string;
                    await authAPI.login(login, password);
                } else {
                    const userData = {
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        login: formData.get('login') as string,
                        phone: formData.get('phone') as string,
                        password: formData.get('password') as string
                    };
                    await authAPI.register(userData);
                }

                await updateState();
                router.navigate('/');

            } catch (error: unknown) {
                let errorMessage = 'Ошибка авторизации';
                
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                
                alert(errorMessage);
                
                submitBtn.disabled = false;
                submitBtn.textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
            }
        });
    }
}