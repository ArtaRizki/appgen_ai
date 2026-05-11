import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1e27',
            color: '#e8eaf0',
            border: '1px solid #2a2f3e',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1a1e27' } },
          error: { iconTheme: { primary: '#fb7185', secondary: '#1a1e27' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
