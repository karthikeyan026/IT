/**
 * Navigation utilities for managing client-side routing
 */

export const navigateTo = (path: string) => {
    window.location.href = path;
};

/**
 * Get the current pathname
 */
export const getCurrentPath = (): string => {
    return window.location.pathname;
};

/**
 * Check if current path is admin
 */
export const isAdminPath = (): boolean => {
    const pathname = window.location.pathname;
    return pathname === '/admin' || pathname.startsWith('/admin/');
};

/**
 * Check if current path is student
 */
export const isStudentPath = (): boolean => {
    const pathname = window.location.pathname;
    return pathname === '/' || !pathname.startsWith('/admin');
};

/**
 * Logout and redirect to login
 */
export const logout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
};
