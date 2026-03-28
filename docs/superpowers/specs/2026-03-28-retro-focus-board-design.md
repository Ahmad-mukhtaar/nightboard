# Retro Focus Board Design

## Summary

Transform the current static quote demo into a desktop-first Pomodoro app with a compact landing page and a retro split-flap working screen. The working screen should feel like an airport departure board: monochrome by default, structured as rows on a fixed tile grid, with subtle state accents only when needed for clarity.

The app remains a static site. It should still run locally for development, but it must also be deployable to any static host without a backend.

## Product Goal

Create a lightweight focus tool that preserves the strongest part of the current project, the retro split-flap board aesthetic, while giving it a real daily use case:

- set a focus duration
- enter one active goal
- enter fullscreen
- let the board run the session with minimal distraction

This should feel closer to a productivity object than to a dashboard or marketing page.

## User Flow

### Landing Page

Keep a small landing page instead of dropping directly into the board.

The landing page contains:

- focus duration selector
- short break selector
- long break selector
- optional sound toggle
- single goal input
- primary `Start Session` button

The landing page should be compact and calm. It is a setup screen, not a product homepage. The current fake early-access UI and marketing copy should be removed.

### Session Start

When the user starts a session:

1. transition into the retro board view
2. display a prestart state such as `STARTING IN 5`
3. give the user a few seconds to enter fullscreen
4. automatically start the focus timer

The prestart state is part of the board, not a modal overlay.

### In Session

The board shows:

- current time
- current mode: `FOCUS`, `SHORT BREAK`, or `LONG BREAK`
- large Pomodoro countdown
- the single active goal
- daily completed session count
- a segmented progress indicator

No todo system should be added. The board should stay visually narrow in scope.

## Visual Direction

### Board Style

Use a monochrome airport-board baseline:

- dark body and tile faces
- white to light-gray text
- minimal visual chrome
- strong grid presence
- authentic mechanical spacing and rhythm

This should feel like a transport board or station board, not a SaaS dashboard.

### Accent Usage

Use restrained accent color only for state signaling:

- prestart countdown
- break mode
- progress emphasis if needed
- completion or reset confirmation

Accent should never overpower the board. The primary read should remain monochrome.

### Layout Model

The main board should not use cards, sidebars, or floating widgets. Information should be expressed as board rows.

Recommended row structure:

- row for live time and session label
- row or rows for the large countdown
- row for active goal
- row for segmented progress
- row for small status information such as daily completed sessions

The progress indicator should be implemented as a full row of board-like cells that fill over time. This matches the board language better than a thin modern strip.

## Motion and Interaction

### Split-Flap Behavior

The transition language should move closer to real airport split-flap behavior:

- only changed characters animate
- updates settle in sequence rather than exploding all at once
- flips should feel mechanical and deliberate
- motion should be consistent across timer, mode, and goal updates

The current colorful scramble effect is useful as a base reference, but it should be reduced and adapted to a more authentic flap feel.

### Controls

Keyboard-first controls should remain available in board mode:

- `Space` pause or resume
- `F` fullscreen
- `R` reset session
- optional next-mode shortcut if it helps testing

Controls should not dominate the UI. A small hint on the landing page or a minimal board footer is enough.

## State and Persistence

Persist a small amount of local state in browser storage:

- focus duration
- break durations
- sound preference
- most recent goal
- daily completed session count if practical within the chosen day-reset model

No account system or backend storage is needed.

## Technical Approach

The project should remain a framework-free static app built from:

- `index.html`
- CSS modules already in `css/`
- JavaScript modules already in `js/`

Likely implementation direction:

- replace current hero-first layout with a two-state UI: landing view and board view
- extend constants and state management to support Pomodoro modes and persisted settings
- update board rendering logic to support timer-driven row content instead of quote rotation
- preserve the existing audio engine, keyboard wiring, and tile architecture where useful

The current quote rotator should either be removed or repurposed into session-state transitions.

## Error Handling

Handle the common cases simply:

- empty goal input: allow it or provide a gentle default such as `FOCUS SESSION`
- fullscreen failure: continue normally without blocking the timer
- audio initialization blocked: continue visually and allow later enablement
- storage unavailable: run as an in-memory session without crashing

## Testing and Verification

Before implementation is considered complete, verify:

- landing page can start a session reliably
- 5-second prestart works and does not block fullscreen
- timer counts down correctly
- focus to break transitions occur correctly
- pause, resume, and reset work from keyboard controls
- saved settings restore on refresh
- board remains readable on typical desktop widths

## Non-Goals

Do not add:

- multi-item todo system
- analytics-heavy productivity reports
- login or cloud sync
- complex settings panels on the board
- bright multicolor board styling as the default

## Implementation Recommendation

Build the redesign as a focused product pivot rather than a patch on top of the quote demo. Reuse the tile engine and overall static-site architecture, but reorganize the app around a real Pomodoro session model and a cleaner airport-board presentation.
