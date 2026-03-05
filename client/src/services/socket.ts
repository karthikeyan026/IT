// This file is deprecated - use Supabase Realtime instead
// See src/services/supabaseRealtime.ts for real-time functionality

// Stub exports for backward compatibility
export const socket = null;

export const connectSocket = (studentId: string, name: string) => {
    console.warn('connectSocket is deprecated. Use Supabase Realtime subscriptions instead.');
};

export const disconnectSocket = () => {
    console.warn('disconnectSocket is deprecated. Use Supabase Realtime unsubscribe instead.');
};
