import type { FC } from 'react';
import styled from 'styled-components';
import { Link } from '@tanstack/react-location';

export const Header = styled<FC>(({ children, ...rest }) => {
  return (
    <header {...rest}>
      <h1>
        <Link to='/'>CodingChat</Link>
      </h1>
      <div>{children}</div>
    </header>
  );
})`
  display: flex;
  padding: 0.5em;
  color: white;
  background-color: #212529;
  > h1 {
    font-size: 1.25em;
    line-height: 2;
    flex-grow: 1;
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
  > div {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;
