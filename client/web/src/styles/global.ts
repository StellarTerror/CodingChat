import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
  }
  h1,h2,h3,h4,h5,h6 {
    font-weight: normal;
    font-size: 1em;
  }
  input {
    min-width: 0;
  }
`;
