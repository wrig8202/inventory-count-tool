# Inventory Count & Supply-Risk System — portfolio demo

An offline, config-driven inventory-counting app for a factory floor, plus a companion variance workbook. Built as the working planner using it — every feature answered a real friction on the floor, not a spec written in advance.

**This repo is a de-branded portfolio demonstration.** The company (PlayCraft), the material families (dough compound, packaging film), and every number are fictional and synthetic. It mirrors the shape of a real tool I built and use in a manufacturing planning role, with all proprietary data, names, and specifics removed. Built with AI-assisted development.

## Live pages

- **`index.html`** — the case study (what it does and why).
- **`demo.html`** — the live tool. Open it and click **Load Demo Data & Start** — no upload needed.
- **`project-writeup.html`** — the full project write-up, in STAR format.

## What it does

- **Guided floor walk** — prompts each stop in the order you physically move; one button completes a stop and advances.
- **Expected-material prompts** — shows what the system says should be at each machine, so you confirm instead of hunt.
- **System vs. actual** — per-location reconciliation with a tolerance band that hides counting noise and flags real gaps.
- **Days of stock, with inbound** — on-hand ÷ demand, plus coverage *after* planned receipts and their ETAs.
- **Transit → receiving** — planned loads count as inbound (never on-hand); receive a whole trailer by number in one tap, with no double-counting.
- **Recurring-discrepancy memory** — problems persist across days, showing how long a location has gone unscanned.
- **CSV export** — feeds a companion planning workbook that computes supplier and standard-weight variance.

## How it's built

One `.html` file. Vanilla JavaScript, no dependencies, no build step, no network. Everything plant-specific — materials, standards, storage bins, machines, the walk order, demand, tolerances — lives in a single config block, so the same engine runs anywhere by swapping the config. Data persists in the browser via `localStorage`; nothing leaves the device.

## Run it

Open `index.html` (or `demo.html`) in any modern browser. To publish, drop these files in a GitHub repo and enable GitHub Pages — see `GITHUB_GUIDE.md`.

---

**Olivia N. Wright** — Data. Operations. AI. Strategy. · [oliviawright.me](https://oliviawright.me)
