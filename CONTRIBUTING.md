# Contributing to Nightboard

Thanks for taking a look at Nightboard.

This is a small static browser project. The scope is intentionally tight: a retro split-flap Pomodoro board and a retro clock board. Contributions are welcome, but they should keep the product simple and readable.

## Before you open an issue

- check whether the bug or idea is already reported
- keep reports narrow and reproducible
- include screenshots or screen recordings for UI issues when possible
- for clock mode issues, include the city you tested and what the weather output did

## Before you open a pull request

- discuss large feature ideas in an issue first
- keep changes focused; avoid unrelated cleanup in the same PR
- preserve the retro board feel and keyboard-first workflow
- prefer small, reviewable patches over large rewrites

## Local development

Serve the repo as a static site:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Run tests with:

```bash
node --test
```

## Design guardrails

Nightboard works best when it stays opinionated.

- favor one strong focal point instead of dashboard clutter
- keep fullscreen views clean and glanceable
- do not introduce accounts, backends, or unnecessary complexity
- keep motion purposeful; split-flap animation should support readability
- clock mode should feel like a pure retro board, not a generic weather app

## Pull request checklist

- the change is scoped to one clear problem
- tests pass locally
- the README or docs are updated if behavior changed
- screenshots are included when the UI changed materially
- no secrets, tokens, or private data were added

## Code style

- follow the existing plain HTML/CSS/JS structure
- prefer small, direct functions over abstraction-heavy patterns
- keep the app static and browser-first
- do not add a build step unless there is a compelling reason

## Questions

If you are unsure whether something fits the project, open an issue first and describe:

- the problem
- the proposed change
- why it belongs in Nightboard
