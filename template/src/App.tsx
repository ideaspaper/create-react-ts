import './App.css';

const foundations = [
  'React 19, Vite 8, and TypeScript 6 ready to go',
  'ESLint flat config plus Prettier as a separate formatter',
  'Vitest, Testing Library, and jsdom for component tests',
  'Path aliases via @/ powered by tsconfig paths',
];

const workflowScripts = ['dev', 'lint', 'test', 'check'];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">React + TypeScript starter</p>
        <h1>Start with a solid React and TypeScript baseline.</h1>
        <p className="hero-copy">
          The scaffolding is ready. Swap this screen for your product entry
          point, keep the feedback loop fast, and grow from a clean default.
        </p>
      </section>

      <section className="panel-grid" aria-label="Starter overview">
        <article className="panel">
          <h2>Included by default</h2>
          <ul className="feature-list">
            {foundations.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Core workflow</h2>
          <ul className="command-list">
            {workflowScripts.map(scriptName => (
              <li key={scriptName}>
                <code>{scriptName}</code>
                <p>Use the corresponding package script as you build.</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="roadmap">
        <div>
          <p className="roadmap-label">Suggested first steps</p>
          <ol>
            <li>Replace this screen with your product entry point.</li>
            <li>
              Update page metadata in <code>index.html</code>.
            </li>
            <li>
              Add your first feature and keep <code>check</code> green.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

export default App;
