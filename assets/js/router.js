// /js/router.js
export function navigate(page, params = {}) {
    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = `/${page}.html${queryString ? '?' + queryString : ''}`;
    
    // Navigate
    window.location.href = url;
}

export function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.replace('/', '').replace('.html', '') || 'splash';
    return page;
}

export function getParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}
