# Before the First Order

**A daily inventory count for a system you can’t quite trust.**

An operations engineering case study by **Olivia N. Wright**, with a hands-on demo at the fictional **Last Slice Pizzeria**. It translates a real manufacturing problem into a setting anyone can understand: usage, receipts, and moves aren’t reliably captured, so every morning starts with physical verification.

- [Case study](https://wrig8202.github.io/inventory-count-tool/)
- [Interactive demo](https://wrig8202.github.io/inventory-count-tool/demo.html)
- [Project write-up](https://wrig8202.github.io/inventory-count-tool/project-writeup.html)

## Try it in about two minutes

Open `demo.html` and choose **Start the opening count**. No upload, account, installation, or setup is needed.

1. **Walk-in cooler:** enter 2 cases of mozzarella. At 2 kg each, that is 4 kg against 12 kg in the system.
2. **Dry storage:** enter 4 bags of flour. At 25 kg each, the physical count matches the 100 kg recorded.
3. **Prep station:** enter 3 tubs of sauce. At 3 kg each, there are 9 kg that the system did not record.
4. Read the opening brief and download your count CSV.

You can enter different quantities, including zero and partial containers, to explore the calculations. Save each change before advancing. Zero is a checked, empty location; an uncounted ingredient stays unknown. Previous stops can be revisited and saved without duplicating their entries.

The brief is calculated from your inputs. The sample observations yield **two corrections** and **one ingredient below a day of stock**. These are synthetic demo results, not business performance claims.

## What the tool demonstrates

- **Guided route:** one location and one primary action at a time.
- **Visible conversions:** container quantity × standard weight = kilograms.
- **Reconciliation:** expected and actual quantities remain attached to location and ingredient.
- **Planning context:** counted containers ÷ sample daily demand gives days of stock.
- **Inbound discipline:** a sample mozzarella delivery remains inbound until received, and cannot be received twice.
- **Handoff:** CSV exports carry counts, variance, and status into the next planning step.

**Explore the full workspace** opens the existing inventory engine with the same counts. It supports storage validation, additional counts, receiving, reconciliation, demand edits, exports, backup/restore, and discrepancy history. The pizzeria configuration uses container equivalents: one mozzarella case is 2 kg, one flour bag is 25 kg, and one sauce tub is 3 kg. Advanced demand fields use containers/day.

The sample delivery reference is `DEMO-01`: 4 mozzarella cases (8 kg), expected tomorrow at 8:00 AM. Counted stock plus inbound is an arithmetic coverage comparison before intervening consumption, not a projected stock balance at arrival. A tomorrow delivery must not be assumed to solve today’s shortage.

## The real problem and the limits of the result

The original daily manufacturing count took roughly two hours. The tool brings entry, conversion, and discrepancy capture into a single workflow, reducing opportunities for manual arithmetic and duplicate transcription.

A measured after-time has not been supplied. The case study therefore includes an **explicitly illustrative**, editable time-savings calculator, rather than claiming a verified percentage reduction. Its annual scenario uses five counts per week and 48 weeks per year. The short demo duration is not a full-count time study.

This tool does **not** fix upstream scanning or transaction discipline by itself. It improves the daily verification workflow and exposes discrepancies for follow-up. It does not automatically update any external inventory system.

## Files and implementation

| File | Purpose |
| --- | --- |
| `index.html` | Problem, solution, engineering contribution, and illustrative savings calculator |
| `demo.html` | Guided pizzeria demo and the underlying inventory workspace |
| `project-writeup.html` | Situation, task, actions, results, design rationale, and limitations |
| `tests/demo.cjs` | Real-browser behavior and responsive-layout checks |

The three pages are self-contained HTML with inline CSS and vanilla JavaScript. They require no application dependencies or build step. Fonts use local fallbacks; there are no external font, image, analytics, or data requests. Open the files locally to use them offline, or serve them as static files. GitHub Pages can serve the root of the repository.

The guided demo uses the existing configuration-driven counting engine. `CONFIG`, `DEMO_FYT`, and the small `stops` list near the end of `demo.html` define the fictional scenario.

### Saving and restarting

Progress is saved in this browser using namespaced `localStorage` keys (`last_slice_*`). The guide and workspace can resume after reload. If storage is unavailable, counts remain usable in the current tab and the guide tells you to export before leaving.

**Restart demo** asks before clearing demo counts, receipts, demand overrides, and discrepancy history. It restores the original synthetic observations and sample delivery. It does not clear unrelated browser storage. Exports and backups download to your device; counts are not sent to a server.

Use this as a portfolio demonstration, not a production inventory system. The advanced import formats are inherited from the original engine and are not required for the walkthrough.

## Verification

Install the development-only browser dependency and run:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/demo.cjs
```

The test starts its own local server and checks the guided flow, invalid/zero/partial entries, editing without duplication, unit conversion, days of stock, inbound versus receipt, duplicate receipt protection, CSV values, reset confirmation/cancellation, reload persistence, and horizontal overflow at 375, 768, and 1440 pixels.

Optional environment variables: `BROWSER_EXECUTABLE` selects an existing Chromium binary; `QA_DIR` saves desktop/mobile screenshots to an existing directory.

---

All business names, ingredients, quantities, locations, demand, and deliveries are fictional. The operational problem is based on real manufacturing work, with employer details removed. **Designed by Olivia N. Wright with AI-assisted development.**

[oliviawright.me](https://oliviawright.me)
