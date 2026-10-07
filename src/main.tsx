import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './GlobalSystemStyles.css';

import { SystemProvider } from './context/SystemContext';
import { VfsProvider } from './context/VfsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemProvider>
      <VfsProvider>
        <App />
      </VfsProvider>
    </SystemProvider>
  </StrictMode>
);
