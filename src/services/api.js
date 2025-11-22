import axios from "axios";

// Use environment variable for API URL, fallback to deployed backend
const API_URL = import.meta.env.VITE_API_URL || "https://pixfolio--6gtwzsxlhwdc.code.run";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const signup = (userData) => api.post("/auth/signup", userData);
export const login = (credentials) => api.post("/auth/login", credentials);
export const verify = () => api.get("/auth/verify");

// Photos API calls
export const getCuratedPhotos = (page = 1, perPage = 30) =>
  api.get("/api/photos/curated", { params: { page, per_page: perPage } });

export const searchPhotos = (query, page = 1, perPage = 30) =>
  api.get("/api/photos/search", { params: { query, page, per_page: perPage } });

export const localSearchPhotos = (search, page = 1, perPage = 30) =>
  api.get("/api/photos/local-search", { params: { search, page, per_page: perPage } });

export const getPhotoById = (id) => api.get(`/api/photos/${id}`);

// Favorites API calls
export const getFavorites = () => api.get("/api/favorites");

export const addFavorite = (photoData) => api.post("/api/favorites", photoData);

export const removeFavorite = (imageId) => api.delete(`/api/favorites/${imageId}`);

export default api;

