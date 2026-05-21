import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders the starter headline', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /start with a solid react and typescript baseline/i,
      }),
    ).toBeInTheDocument();
  });

  test('lists the core workflow scripts', () => {
    render(<App />);

    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getAllByText('check')).toHaveLength(2);
  });

  test('shows the recommended next steps', () => {
    render(<App />);

    expect(
      screen.getByText(/replace this screen with your product entry point/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/update page metadata in/i)).toBeInTheDocument();
  });
});
