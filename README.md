# ADTMCplus MSK

This workspace preserves the original `ADTMCplus` browser tool under [legacy/index.html](/Users/matthewholtkamp/Documents/ADTMCplus-msk/legacy/index.html) and adds a new full-stack MSK screening and referral application under [apps/msk-referral](/Users/matthewholtkamp/Documents/ADTMCplus-msk/apps/msk-referral).

## Structure

- `legacy/index.html`: original single-file SOAP generator preserved intact
- `apps/msk-referral`: Next.js App Router UI and API routes
- `packages/msk-content`: validated pathway content, shared types, schemas, and deterministic rule engine

## Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Notes

- The MSK tool is strictly deterministic. There is no LLM or AI dependency in the clinical workflow.
- Every rule, question, escalation path, and note section is derived from the encoded PDF algorithms.
