import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders the starter template headline', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /start with a template that is already opinionated/i,
      }),
    ).toBeInTheDocument();
  });

  test('lists the key project commands', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 2, name: /common commands/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('npm run dev')).toBeInTheDocument();
    expect(screen.getByText('npm run test')).toBeInTheDocument();
    expect(screen.getAllByText('npm run check')).toHaveLength(2);
  });

  test('shows the built-in tooling summary', () => {
    render(<App />);

    expect(
      screen.getByText(
        /eslint 9 with typescript, react hooks, import ordering, and prettier integration/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/husky, lint-staged, and commitlint/i),
    ).toBeInTheDocument();
  });
});
