import axios from 'axios';
import { sanitizeInput } from './Utils/sanitize';

const axiosGlobal = globalThis as typeof globalThis & {
    axios: typeof axios;
};

axiosGlobal.axios = axios;

axiosGlobal.axios.defaults.withCredentials = true;
axiosGlobal.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axiosGlobal.axios.interceptors.request.use((config: any) => {
    // Ne pas modifier les FormData (upload de fichiers)
    if (config.data && !(config.data instanceof FormData)) {
        config.data = sanitizeInput(config.data);
    }

    if (config.params) {
        config.params = sanitizeInput(config.params);
    }

    return config;
});

axiosGlobal.axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        if (error?.response?.status === 401) {
            globalThis.location.href = '/login';
        }

        return Promise.reject(error);
    },
);