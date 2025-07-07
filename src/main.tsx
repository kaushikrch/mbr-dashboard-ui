import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

const theme = extendTheme({});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
