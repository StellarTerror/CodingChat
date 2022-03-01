import styled from 'styled-components';
import { Link } from '@tanstack/react-location';

export const Header = styled(({ children, className }) => {
  return (
    <header className={className}>
      <div>
        <Link to='/'>CodingChat</Link>
      </div>
      <div>{children}</div>
    </header>
  );
})``;
