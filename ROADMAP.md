# FORMA AI — Product Roadmap

> Planning document for the public **portfolio demo**. None of the features below are complete or available in the current public preview. The commercial application's internal source code will be developed in a separate, private repository.

## Vision

Turn FORMA AI into a fitness experience where an exercise is not just a name in a workout: each exercise has evidence-reviewed metadata, clear visual instructions, and a consistent virtual trainer.

## Exercise Atlas — staged delivery

| Stage | Deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 1. Taxonomy | Muscles, movement patterns, equipment, difficulty and aliases (IT/EN) | Valid schema, deduplication, transparent sources | Planned |
| 2. Curated library | Initial set of ~50 diverse exercises, with home-gym alternatives | Each entry includes instructions, cautions, and attributions; reviewed by a qualified trainer | Planned |
| 3. Anatomy | Consistent 3D-style anatomical illustrations for each selected exercise | Primary/secondary muscles checked; labels understandable; assets licensed or original | Planned |
| 4. Virtual trainer | One original, consistent 3D trainer identity and static start/end poses | Coherent anatomy/positioning across assets; labeled demonstrations | Planned |
| 5. Motion | Optional short demonstrations, with reduced-motion support | Motion and cues reviewed for accuracy; accessible still image alternative | Planned |
| 6. App integration | Search, filters, exercise details and Home Gym equipment matching | Automated data validation and user testing | Planned |
| 7. Personalized coaching | Use the curated library as a controlled retrieval source for the private AI coach | No fabricated exercise identifiers; safety checks and qualified review | Planned |

### Proposed exercise record

```json
{
  "id": "dumbbell-bench-press",
  "name": { "it": "Distensioni con manubri su panca", "en": "Dumbbell Bench Press" },
  "primaryMuscles": ["pectoralis-major"],
  "secondaryMuscles": ["triceps-brachii", "anterior-deltoid"],
  "equipment": ["dumbbell", "bench"],
  "movement": "horizontal-push",
  "level": "intermediate",
  "assets": {
    "anatomy": null,
    "trainerStart": null,
    "trainerEnd": null,
    "animation": null
  },
  "reviewStatus": "draft",
  "sources": []
}
```

This is a **schema example**, not a validated exercise prescription.

## Design language

- A recognizable FORMA AI identity: dark graphite, lime highlights, and clean anatomy visuals.
- One original virtual trainer with consistent proportions, clothing, camera angle and lighting.
- Separate visual states for targeted muscles, starting position and ending position.
- Realistic claims: illustrative anatomy, not a diagnostic tool or an automatic guarantee of safe technique.
- Accessibility: contrast, meaningful alt text, captions and reduced-motion alternatives.

## Data provenance and safety

- Prefer open or permissively licensed exercise data, original structured descriptions, or individually authorized sources.
- Check terms of use and relevant restrictions before any scraping; respect robots policies and avoid bulk copying of protected assets.
- Keep source links, licenses, review status and asset provenance on each exercise.
- Have technique descriptions, movement demonstrations and muscles involved reviewed by qualified professionals before public health or fitness claims.
- Do not interpret the visual asymmetry of a single 2D video as a reliable measurement of muscle force or injury.
- Keep personal photos, biometric data, AI credentials and training history out of the public repository.

## Public demo versus commercial app

**Public demo:** interface, screenshots, a small illustrative set of **non-sensitive, intentionally demonstrative** exercises, product announcements, and the README animation.

**Private product:** complete curated dataset (subject to third-party licenses), personalized logic, commercial Android build, protected backend, API configuration, and user's private health information.

The original public repository historically contained a fuller prototype under MIT; that history and previously granted licenses must be considered separately from current source visibility.

## Release milestones

- **Milestone A:** data schema and professionally reviewed pilot exercises.
- **Milestone B:** validated 3D anatomy samples plus original trainer concept.
- **Milestone C:** exercise-detail interaction in the private Android prototype.
- **Milestone D:** public demo updated with accurately labeled previews.
- **Milestone E:** Play Store compliance, accessibility, privacy, QA and production readiness.

The schedule is intentionally **not dated** until these milestones have been scoped and tested.
