# Radio Vaigyaaniq — RJ Transcript System

Voice patter for a preview-first station: **intro → 60s preview → full-track CTA → next-up tease**, with a **samaya (time) change alert every 24 minutes**. Feeds the Persona TTS engine.

Language: **Hinglish** (default — matches the catalogue). Pure-Hindi and pure-English variants can be generated on request.

## Personas (map to the TTS voices already in the app)
- **Vaigyaaniq** — main anchor / RJ (science-anchor tone). Does intros, CTAs, next-up.
- **Samaya** — ceremonial time-keeper. Does the 24-minute samaya alerts only.

## Segment cadence
```
[Vaigyaaniq: TRACK INTRO  ~12s]
[ 60s PREVIEW plays ]
[Vaigyaaniq: FULL-TRACK CTA  ~10s]
[Vaigyaaniq: NEXT-UP TEASE  ~8s]
→ next track …
every ~24 min (≈ every 4–5 preview slots):
[Samaya: TIME-CHANGE ALERT  ~18s]
```

Variables filled from the catalogue: `{title}` `{styleShort}` (first 3–4 style tags) `{nextTitle}` `{nextStyleShort}` `{price}` (₹10) `{samayaState}` `{samayaNext}`.

---

## 1) TRACK INTRO — Vaigyaaniq  (rotate for variety)
1. "Aap sun rahe hain **Radio Vaigyaaniq**, 102.5 — jahaan vigyan aur sangeet milte hain. Agli dhun: **{title}** — {styleShort}. Iska pehla ek minute, abhi suniye."
2. "Frequency lock ho gayi hai. Pesh hai **{title}** — {styleShort} ke rang mein. Preview shuru…"
3. "Ye hai **{title}**. {styleShort}. Ek minute ka glimpse taiyaar hai — dhyaan se."
4. "Discover the science, tune into the future. Abhi bajne waali hai **{title}** — {styleShort}."

## 2) FULL-TRACK CTA — Vaigyaaniq  (after the 60s preview)
1. "Bas ek minute kaafi nahin tha na? **Poori {title}** sunne ke liye sirf **₹{price}** mein unlock — ek baar, lifetime, aapke email se."
2. "Dil ne kaha 'aur'? Full track ek tap door hai — **₹{price}** mein unlock, ya **Radio Pro** lekar iske **saare versions** paayein."
3. "Preview yahin tak. Poora gaana chahiye toh — **unlock for ₹{price}**, no subscription, hamesha ke liye aapka."
4. "Agar ye dhun chhoo gayi — **₹{price}** mein full track, aur Pro pe har version. Aapki marzi, aapka sangeet."

## 3) NEXT-UP TEASE — Vaigyaaniq
1. "Aur rukiye mat — **next up: {nextTitle}**, {nextStyleShort}. Tune mat badaliyega."
2. "Aage aa raha hai **{nextTitle}** — {nextStyleShort}. Radio Vaigyaaniq ke saath bane rahiye."
3. "Iske baad: **{nextTitle}**. {nextStyleShort}. Ek aur safar, ek aur frequency."

## 4) SAMAYA TIME-CHANGE ALERT — Samaya  (every 24 min)
1. "॥ Samaya soochna ॥ Samaya badal raha hai. Hemant Samwat ke is pal mein — **{samayaState}**. Aane wala samay: **{samayaNext}**. Saans lijiye, aur sunte rahiye **Radio Vaigyaaniq**."
2. "Ghadi ki sui aage badhi. Ab pravesh kar rahe hain **{samayaState}** mein — agla muhurat **{samayaNext}**. Samay ke saath, sangeet ke saath."
3. "Chaubees minute beet gaye. **{samayaState}** ka samaya hai. Aage: **{samayaNext}**. Radio Vaigyaaniq — samay ke pravaah mein."

---

## Worked example — one ~24-minute block (real tracks)

**[Samaya 00:00]** "॥ Samaya soochna ॥ Hemant Samwat ke is pal mein — *Prabhaat Sandhya*. Aane wala samay: *Madhyaahn Taap*. Sunte rahiye Radio Vaigyaaniq."

**[Intro]** "Aap sun rahe hain Radio Vaigyaaniq, 102.5. Agli dhun: **Vaps A Gaye** — modern Sufi Qawwali fusion, patriotic anthem. Iska pehla ek minute, abhi."
*— 60s preview —*
**[CTA]** "Bas ek minute kaafi nahin tha na? Poori *Vaps A Gaye* ke liye sirf ₹10 mein unlock — lifetime, aapke email se."
**[Next]** "Next up: **Chandmahi** — traditional Sufi Qawwali, female vocal. Tune mat badaliyega."

**[Intro]** "Pesh hai **Chandmahi** — virah ki gehrai, dholak aur harmonium ke saath. Preview shuru…"
*— 60s preview —*
**[CTA]** "Dil ne kaha 'aur'? *Chandmahi* full ₹10 mein, ya Radio Pro pe iske saare versions."
**[Next]** "Aage: **soofi** — cinematic folk fusion, Persian rang."

**[Intro]** "Ye hai **soofi**. Sufi drone aur 808 bass ka milan. Ek minute ka glimpse — dhyaan se."
*— 60s preview —*
**[CTA]** "Preview yahin tak. Poora *soofi* chahiye? Unlock for ₹10 — no subscription."
**[Next]** "Iske baad: **Bukkal Mein Aaja Laadi** — Indian Sufi folk, Silk Route caravan."

**[Intro]** "Pesh hai **Bukkal Mein Aaja Laadi** — santoor, sarangi, oud ka safar. Preview shuru…"
*— 60s preview —*
**[CTA]** "Agar ye chhoo gaya — ₹10 mein full track, aur Pro pe har version."
**[Next]** "Aur abhi rukiye mat…"

**[Samaya ~24:00]** "Chaubees minute beet gaye. Ab *Madhyaahn Taap* ka samaya hai. Aage: *Aparaahn Vishraam*. Radio Vaigyaaniq — samay ke pravaah mein."

---

## Notes for the generator
- Pull `{title}`, `{styleShort}` (first 3 tags), and the **next** track from the playlist order (free-tier = canonical version per song).
- Keep each spoken beat short (TTS budget): intro ≤ 28 words, CTA ≤ 22, next-up ≤ 16, samaya ≤ 36.
- Rotate template variants by index so consecutive slots don't repeat.
- Samaya states cycle through the Hemant Samwat day-parts (Prabhaat → Madhyaahn → Aparaahn → Sandhya → Ratri …); trigger one every 24 minutes of playback, not every N tracks.
- Never assert verified facts about a track (PHKD fail-closed) — patter stays evocative, not factual claims.
