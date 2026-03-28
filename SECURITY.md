# Security Notes

Nightboard is a low-risk static browser app.

## What the project does not do

- no user accounts
- no backend
- no authentication
- no secret keys in the repo
- no database
- no server-side session state

## Data handled locally

The app stores lightweight preferences in browser `localStorage`, including:

- selected mode
- Pomodoro durations
- sound preference
- focus goal
- city name for clock mode

This data stays in the user's browser.

## External network usage

Clock mode performs client-side requests to Open-Meteo:

- geocoding API to resolve the typed city
- forecast API to fetch current weather

That means the typed city name is sent directly from the browser to Open-Meteo. The project does not proxy or store those requests.

## Frontend hardening included

- restrictive Content Security Policy in `index.html`
- `Referrer-Policy`
- `Permissions-Policy` with unnecessary browser capabilities disabled

## Honest scope

This is not a security product and makes no strong security guarantees beyond being a simple static site with no auth or backend secrets.
