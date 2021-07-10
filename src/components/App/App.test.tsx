import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hello World', () => {
  render(<App />);
  const divElement = screen.getByText(/Hello World/i);
  expect(divElement).toBeInTheDocument();
});
