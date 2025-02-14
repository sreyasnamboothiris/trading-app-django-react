import api from './api';
import { store } from './store/store'; // Import the store
import { isAuthenticated } from './store/authSlice'; // Import the action

let refresh = false;


api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401 && !refresh) {
            refresh = true;

            try {

                const refreshToken = localStorage.getItem('refreshToken');
                const user = JSON.parse(localStorage.getItem('userInfo'));
                const response = await api.post('/user/token/refresh/', {
                    refresh: refreshToken,
                    user_id:user.user_id
                });

                // Save new tokens
                localStorage.setItem('accessToken', response.data.access);

                // Dispatch the updated token to Redux store
                const state = store.getState()
                const authState = state.auth
                
                store.dispatch(isAuthenticated(response.data));
                

                // Retry the original request with the new access token
                error.config.headers['Authorization'] = `Bearer ${response.data.access}`;
                return api.request(error.config);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';  // Redirect to login page
            } finally {
                refresh = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
