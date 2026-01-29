import {render, screen} from '@testing-library/react';

// describe and test are available globally via vitest/globals
import App from './App';

describe('App', () => {
  test('should work as expected', async () => {
    render(<App />);

    const buttonElement = screen.getByText(
      /Click on the Vite and React logos to learn more/i,
    );

    expect(buttonElement).toBeInTheDocument();
  });
});
