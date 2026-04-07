import './App.css';

const scripts = [
  {
    name: 'dev',
    command: 'npm run dev',
    description: 'Start the Vite dev server.',
  },
  {
    name: 'test',
    command: 'npm run test',
    description: 'Run the Vitest suite.',
  },
  {
    name: 'check',
    command: 'npm run check',
    description: 'Run linting, tests, and production build in one pass.',
  },
];

const foundations = [
  `React 19 + Vite 8 + TypeScript 6`,
  `ESLint 9 with TypeScript, React Hooks, import ordering, and Prettier integration`,
  `Vitest 4 + Testing Library + jsdom 29`,
  `Husky, lint-staged, and commitlint`,
  `Path alias support via @/`,
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">React + TypeScript starter</p>
        <h1>
          Start with a template that is already opinionated in the useful
          places.
        </h1>
        <p className="hero-copy">
          This project ships with a modern toolchain, lightweight starter UI,
          and a validation path you can trust before the first feature lands.
        </p>
        <div className="hero-actions">
          <a
            className="primary-link"
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
          >
            React docs
          </a>
          <a
            className="secondary-link"
            href="https://vite.dev"
            target="_blank"
            rel="noreferrer"
          >
            Vite docs
          </a>
        </div>
      </section>

      <section className="panel-grid" aria-label="Template details">
        <article className="panel">
          <h2>Included by default</h2>
          <ul className="feature-list">
            {foundations.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Common commands</h2>
          <ul className="command-list">
            {scripts.map(script => (
              <li key={script.name}>
                <code>{script.command}</code>
                <p>{script.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="roadmap">
        <div>
          <p className="roadmap-label">Recommended first edits</p>
          <ol>
            <li>Replace this screen with your product entry point.</li>
            <li>
              Update page metadata in <code>index.html</code>.
            </li>
            <li>
              Add features behind tests and keep <code>npm run check</code>{' '}
              green.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

export default App;
