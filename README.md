# MoodMirror AI
Webcam/photo facial-expression estimator + Bollywood/anime expression matcher. 100% in-browser, no paid APIs.

## Run (needs a local server; camera & ES modules don't work from file://)
    cd moodmirror
    python3 -m http.server 8000     # then open http://localhost:8000   (or: npx serve)
Needs internet on first load (MediaPipe library from jsDelivr, model file from storage.googleapis.com). To go offline, download these and change the URLs in `emotion-detector.js`.

## Add images
Put files in `assets/ref/` matching names in `character-data.js` (only images you have rights to). Missing images show an emoji placeholder. VERIFY each entry's `expr` label matches the actual image.

## Files
emotion-detector.js (model + rules) · character-data.js (matches, recommendations) · matching-engine.js · result-card.js (download/share) · app.js (UI) · index.html/styles.css

## Limitations
Expression ≠ emotion. The app maps facial muscle movements (blendshapes) to labels using hand-tuned rules (not a trained 7-class classifier), so thresholds in `classify()` may need tuning. Lighting, angle, glasses/masks affect results. Bars are cue strengths, NOT calibrated probabilities. Matches are curated labels, for fun only — not identity recognition. Photos never leave the device and are never in the share card.

## Troubleshooting
Camera blocked → site settings/HTTPS or localhost. "Model failed" → check internet/CDN, press Retry. Share unsupported → use Download/Copy.

## Image APIs
Anime portraits: Jikan (no key). Bollywood: get a free key at themoviedb.org/settings/api, paste into ⚙ Settings. Order: local `assets/ref/` file -> API -> emoji. API portraits aren't expression-specific.
