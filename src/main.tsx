import React from 'react';
import ReactDOM from 'react-dom/client'; // not just 'react-dom'
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
