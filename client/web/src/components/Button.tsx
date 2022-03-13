import styled, { css } from 'styled-components';

export const blueButtonCss = css`
  border: none;
  border-radius: 0.25em;
  padding-inline: 0.5em;
  font-size: 1em;
  line-height: 2;
  background-color: #0d6efd;
  color: white;
`;

export const BlueButton = styled.button`
  ${blueButtonCss}
`;

export const planeButtonCss = css`
  border: none;
  padding-inline: 0.5em;
  font-size: 1em;
  line-height: 2;
  color: inherit;
  background-color: inherit;
`;

export const PlaneButton = styled.button`
  ${planeButtonCss}
`;
