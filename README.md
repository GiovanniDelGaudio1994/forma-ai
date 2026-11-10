# FORMA AI — Public Experience Demo

**The fitness app that adapts to you.** *(Product concept and interactive prototype.)*

[![Demo](https://img.shields.io/badge/Experience-Interactive%20Demo-baff6b?style=for-the-badge&labelColor=12171d)](https://github.com/GiovanniDelGaudio1994/forma-ai)
![Rights](https://img.shields.io/badge/License-All%20Rights%20Reserved-8d94a5?style=for-the-badge&labelColor=12171d)
![Status](https://img.shields.io/badge/Status-Portfolio%20Preview-a998ff?style=for-the-badge&labelColor=12171d)

> **This repository contains a demonstration of the FORMA AI product experience, not the commercial application or its proprietary algorithms.**

## ✨ What you can try

- **Dashboard** — elegant sport-tech interface, weekly timeline and sample metrics.
- **Workout preview** — switch among Massa, Forza, Definizione, Dimagrimento and Mantenimento and browse prewritten workout examples.
- **Nutrition** — visual recipe cards with explicit allergen warnings. No personalized or allergy-safe meal advice.
- **Check & progress** — fictional body metrics, illustration chart and photo placeholders.
- **Coach preview** — static educational examples; **there is no live AI model here**.
- **Motion Lab** — design preview only; **no video recording, uploads or form analysis**.

The preview runs entirely in the browser without sign-up, keys or backend services. It **does not collect real user fitness or health data**.

### Open locally

Open `index.html` in a browser. No build system is required. For a local static server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080. No production AI APIs are used.

### Publish on GitHub Pages

Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.

A workflow in `.github/workflows/pages.yml` can publish this **static demo** after pushes to `main`. GitHub Pages deployment is not automatic until Pages is enabled and the workflow succeeds.

## 🔒 Code and commercial development

This repository intentionally does **not** contain the complete product source, the AI engine, prompt/validation system, nutritional decision logic, personal media storage, or Android application.

The full commercial version is intended for a **separate private repository** and a backend that keeps API credentials secure. An Android release will require a Play Console setup, Google Play health-app compliance, a real privacy policy and extensive safety testing before publication.

**Important historical notice:** this repository originally contained FORMA AI v0.2.0 with an MIT license. Removing code from the newest branch does *not* remove it from old Git history, forks or downloaded copies, and previously granted MIT permissions cannot automatically be revoked. A clean public demo repository and a private full-source repository are recommended before commercial launch.

## ⚕️ Health & safety

Workout and food content are clearly labeled as examples. They are **not individualized recommendations**, verified gluten-free meals, medical advice or an injury assessment. The future commercial app will require safety reviews for exercise, allergies, celiac disease, health data and video analysis.

## 📄 Rights

Copyright © 2026 Giovanni Del Gaudio. All rights reserved. Source is publicly viewable for portfolio evaluation; it is not an open-source license. See [LICENSE](LICENSE).

## 👨‍💻 Author

[GiovanniDelGaudio1994](https://github.com/GiovanniDelGaudio1994) — Software Development Portfolio.
