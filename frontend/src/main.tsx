import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import App from './App.tsx'
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </HelmetProvider>
    </StrictMode>,
)