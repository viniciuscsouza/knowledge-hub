# knowledge-hub-pwa

![Codecov](https://img.shields.io/codecov/c/github/viniciuscsouza/knowledge-hub?logo=codecov)
![CI](https://github.com/viniciuscsouza/knowledge-hub/actions/workflows/ci-deploy.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-97.05%25-brightgreen)

This is a Next.js project.

Getting started

Run the development server:

```bash
npm run dev
```

Run tests once:

```bash
npm test -- --watchAll=false
```

Generate coverage report:

```bash
npm run test:coverage
```

Test Coverage
-------------

Current coverage (local run): 97.05% statements, 87.69% branches, 100% functions, 99.47% lines.

Where to see the report:

- Locally: run `npm run test:coverage` and open `coverage/lcov-report/index.html` in a browser.
- CI / Codecov: the GitHub Actions workflow uploads coverage to Codecov and the dashboard is linked in the project.

If Codecov is not reporting for private repos, add `CODECOV_TOKEN` to repository Secrets (Settings → Secrets → Actions).

Codecov
------

This repo uploads coverage to Codecov in the CI workflow. If your repository is private, add the `CODECOV_TOKEN` secret in the repository settings (Settings → Secrets → Actions).


More details are in the repository.

Branching model
---------------

This repository uses a single development branch named `develop`. Work and commits for ongoing development should be pushed directly to `develop`; use `main` only for releases or production merges.

