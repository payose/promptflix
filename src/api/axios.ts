import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface APIConfig {
    baseURL: string;
    apiKey: string;
    keyParam?: string;
    authType: 'urlParam' | 'headerBearer';
}

class APIService {
    private static configs: Record<string, APIConfig> = {
        tmdb: {
            baseURL: import.meta.env.VITE_APP_TMDB_BASE_URL || '',
            apiKey: import.meta.env.VITE_APP_TMDB_API_KEY || '',
            keyParam: 'api_key',
            authType: 'urlParam'
        },
        openai: {
            baseURL: import.meta.env.VITE_APP_OPENAI_BASE_URL || '',
            apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY || '',
            authType: 'headerBearer'
        },
        youtube: {
            baseURL: import.meta.env.VITE_APP_YOUTUBE_URL || '',
            apiKey: import.meta.env.VITE_APP_YOUTUBE_KEY || '',
            keyParam: 'key',
            authType: 'urlParam'
        }
    };

    private static instances: Record<string, AxiosInstance> = {};

    static getInstance(serviceName: keyof typeof APIService.configs): AxiosInstance {
        if (!this.instances[serviceName]) {
            const config = this.configs[serviceName];

            const axiosConfig: AxiosRequestConfig = {
                baseURL: config.baseURL,
                params: config.authType === 'urlParam' && config.keyParam
                    ? { [config.keyParam]: config.apiKey }
                    : {}
            };

            const instance = axios.create(axiosConfig);

            instance.interceptors.request.use(
                (requestConfig) => {
                    if (config.authType === 'headerBearer') {
                        requestConfig.headers['Authorization'] = `Bearer ${config.apiKey}`;
                    }
                    return requestConfig;
                },
                (error) => Promise.reject(error)
            );

            this.instances[serviceName] = instance;
        }

        return this.instances[serviceName];
    }
}

// Service-specific fetch methods
// export const fetchTMDBMovie = async (endpoint: string) => {
//     const tmdbInstance = APIService.getInstance('tmdb');
//     return tmdbInstance.get(`/${endpoint}`);
// };

// export const searchYouTubeVideos = async (query: string) => {
//     const youtubeInstance = APIService.getInstance('youtube');
//     return youtubeInstance.get('/search', {
//         params: {
//             q: query,
//             maxResults: 1
//         }
//     });
// };

// export const createOpenAICompletion = async (prompt: string) => {
//     const openaiInstance = APIService.getInstance('openai');
//     return openaiInstance.post('/chat/completions', {
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: prompt }]
//     });
// };

export default APIService;