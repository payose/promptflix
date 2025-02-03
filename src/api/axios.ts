import axios, { AxiosInstance } from 'axios';

// Define an interface for API configurations
interface APIConfig {
    baseURL: string;
    apiKey: string;
}

// Create a class to manage multiple API configurations
class APIService {
    // Private static instance to store configurations
    private static configs: Record<string, APIConfig> = {
        default: {
            baseURL: import.meta.env.VITE_APP_TMDB_BASE_URL || '',
            apiKey: import.meta.env.VITE_APP_TMDB_API_KEY || ''
        },
        // Additional API configurations can be added here
        aiService: {
            baseURL: import.meta.env.VITE_APP_OPENAI_BASE_URL || '',
            apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY || ''
        },
        youTubeService: {
            baseURL: import.meta.env.VITE_APP_YOUTUBE_URL || '',
            apiKey: import.meta.env.VITE_APP_YOUTUBE_KEY || ''
        }
    };

    // Cached Axios instances to improve performance
    private static instances: Record<string, AxiosInstance> = {};

    // Method to get or create an Axios instance for a specific service
    static getInstance(serviceName: keyof typeof APIService.configs = 'default'): AxiosInstance {
        // If instance doesn't exist, create it
        if (!this.instances[serviceName]) {
            const config = this.configs[serviceName];

            // Create Axios instance with base configuration
            const instance = axios.create({
                baseURL: config.baseURL,
                // You can add more default configurations here
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });

            // Optional: Add request interceptor for additional customization
            instance.interceptors.request.use(
                (requestConfig) => {
                    // You can modify request config here if needed
                    // For example, dynamically adding additional headers or query params
                    return requestConfig;
                },
                (error) => Promise.reject(error)
            );

            // Optional: Add response interceptor for global error handling
            instance.interceptors.response.use(
                (response) => response,
                (error) => {
                    // Centralized error handling
                    console.error(`API Error in ${serviceName} service:`, error);
                    return Promise.reject(error);
                }
            );

            // Cache the instance
            this.instances[serviceName] = instance;
        }

        return this.instances[serviceName];
    }

    // Utility method to get current configuration (useful for debugging)
    static getConfig(serviceName: keyof typeof APIService.configs = 'default'): APIConfig {
        return this.configs[serviceName];
    }
}

export default APIService;