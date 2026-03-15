const isProd = import.meta.env.PROD
export const apiBase = isProd ? '' : (import.meta.env.VITE_API_BASE || 'http://localhost:5001')
