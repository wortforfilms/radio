# Proposal for Prasar Bharati

## Radio Vaigyaaniq: Evidence-First Multilingual Science, Culture, and Public Knowledge Audio Pilot

Prepared date: 2026-07-02  
Prepared for: Prasar Bharati / Akashvani / Doordarshan / WAVES review  
Prepared by: Radio Vaigyaaniq project team  
Status: Draft proposal, not a broadcast-ready claim

---

## 1. Executive Summary

Radio Vaigyaaniq proposes a controlled pilot with Prasar Bharati for a multilingual, evidence-first audio and digital knowledge programming layer focused on science, public knowledge, Indian civilizational literacy, regional music discovery, education, and youth-oriented audio storytelling.

The project is currently suitable for review, demonstration, editorial evaluation, technical due diligence, and pilot planning. It is not being represented as ready for broadcast, commercial release, monetization, syndication, or public distribution until rights, playback, editorial, release-review, and licensing gates are closed.

The proposal aligns with Prasar Bharati's public-service focus on fair and balanced public-interest information, education, literacy, rural development, science and technology, and innovation in broadcast technology, as described on Prasar Bharati's official site.

---

## 2. Proposed Collaboration

### Proposal

Run a 90-day controlled pilot to evaluate Radio Vaigyaaniq as a public knowledge audio layer that can support:

- Akashvani-style multilingual radio programming concepts.
- WAVES / digital-first discovery pages.
- Youth-facing science and culture explainers.
- Regional and Indic knowledge audio catalogs.
- Evidence-backed content sourcing, metadata, and rights review workflows.
- AI-assisted programming tools where every output is marked with provenance, verification state, and human-review requirements.

### Pilot Mode

The pilot should run in a controlled, non-public, non-commercial mode unless Prasar Bharati and the project owner explicitly approve rights-cleared content for external release.

---

## 3. Why This Fits Prasar Bharati

Prasar Bharati's official public description emphasizes public-interest information, education, literacy, agriculture, rural development, environment, health and family welfare, science and technology, constitutional values, social justice, vulnerable communities, research, broadcast capability expansion, and innovation in broadcast technology.

Radio Vaigyaaniq contributes a complementary experimental layer:

- Public knowledge programming: science, culture, history, language, and education.
- Multilingual station logic: Hindi, Sanskrit, Haryanvi, Braj, English, and expandable regional channels.
- Evidence-first content governance: every content item can carry source, creator, rights, checksum, review state, and release status.
- Broadcast-modern UI: web dashboard, station catalog, visualizer, lyrics, TTS announcement personas, and desktop/Tauri direction.
- Fail-closed readiness: incomplete rights or playback proof prevents release claims.

---

## 4. Current Local Runtime Inventory

### Imported Track Catalog

Source: local Radio Vaigyaaniq runtime evidence.

| Metric | Current Count |
|---|---:|
| Catalog tracks imported to DB | 1,186 |
| Tracks with styles present | 1,082 |
| Tracks with lyric text files present | 1,186 |
| Tracks with parsed lyric body present | 0 |
| Audio media objects | 1,186 |
| Cover media objects | 1,182 |
| Track-media links | 2,368 |

### Runtime Programming Collections

| Collection | Tracks |
|---|---:|
| Sanatan & Devotional | 241 |
| Cinematic & Other | 91 |
| Folk & Regional | 83 |
| Hip-Hop & Rap | 78 |
| Sufi & Qawwali | 53 |
| Classical & Raga | 21 |
| Electronic & Fusion | 5 |

### Canonical Station Layer

| Station | Slug | Primary Themes | Current Tracks |
|---|---|---|---:|
| Sanaatana Vaigyaniq | `sanaatana-vaigyaniq` | Sanatan & Vedic, Classical & Raag | 412 |
| Kabir Clubbing | `kabir-clubbing` | Bhakti & Katha, Rap & Fusion, Naagin & Mystic | 342 |
| Gurukul | `gurukul` | Other / Misc | 271 |
| Ameerpur | `ameerpur` | Haryanvi Folk, Desh / Patriotic, Love & Virah | 161 |

---

## 5. Programming Concepts for Pilot

### A. Vaigyaaniq Vigyan Vaani

Short science explainers in Hindi and English with editorial fact-check gates.

Potential formats:

- 3-minute science capsule.
- 8-minute youth explainer.
- Regional language versioning.
- Teacher-led classroom episode.

### B. Lok Vigyan and Gram Gyaan

Audio segments translating useful science and public knowledge into rural and regional storytelling formats.

Potential themes:

- Agriculture science.
- Water, health, weather, environment.
- Public-service announcements.
- Local innovation stories.

### C. Bharatiya Gyaan Parampara Capsule

Evidence-marked cultural literacy capsules covering language, scripts, music, knowledge systems, history, and literature without making unverifiable claims.

PHKD rule:

- Unknown values must be NULL.
- No fabricated citations.
- No definitive claims for disputed/undeciphered traditions.
- Human editorial review required before publication.

### D. Youth Radio Lab

A digital-first lab for student participation:

- Science rap and spoken word.
- Quiz-style audio.
- Safe AI-assisted script drafting.
- Student voice submissions with consent and moderation.

### E. Archive-Aware Storytelling

If Prasar Bharati provides approved archive access, build metadata-first discovery and educational context around archive materials. No archive usage is assumed or claimed without formal permission.

---

## 6. Evidence and Governance Model

Radio Vaigyaaniq should operate under an evidence-first release model:

| Gate | Requirement | Current Status |
|---|---|---|
| Rights closure | Rights proof, owner approval, usage scope, expiry, territory | Blocked |
| Playback gate | Playable file, checksum, format, duration, storage proof | Blocked |
| Editorial review | Human review, fact check, sensitive-content check | Blocked |
| Release review | Final sign-off and distribution scope | Blocked |
| Commercial licensing | Product-owner license, Suno/commercial AI licensing proof where applicable | Blocked unless supplied |
| Public distribution | Only after all gates pass | Not allowed |

Current local playback-gate evidence shows 105 local audio files indexed, 0 playable approvals, 105 blocked, and releaseAllowed = 0. Current rights-closure packet shows 19 rights records prepared, 0 closed, and 19 blocked.

---

## 7. Content Sourcing and Policy Fit

Prasar Bharati maintains official content sourcing resources, including the Prasar Bharati Content Sourcing Policy 2024 and a Pay-Per-View Content Sourcing Policy Pilot Framework 2025-26. This proposal is framed to fit policy review rather than bypass it.

Suggested submission mode:

- Treat Radio Vaigyaaniq as a pilot/demo proposal.
- Submit only rights-cleared sample episodes.
- Keep AI-assisted materials clearly marked.
- Provide all creator/source/rights/evidence records.
- Avoid public or commercial use until Prasar Bharati's applicable content sourcing and legal processes approve it.

---

## 8. Technical Architecture

### Current Stack

- Next.js web surface.
- TypeScript runtime.
- Prisma data model.
- SQLite local development DB.
- Optional PostgreSQL production target.
- JSON data import/export.
- Local media object model with DB/media separation.
- Tauri desktop direction.
- Evidence data frames for release, rights, signing, playback, and payment proof lanes.

### Proposed Pilot Architecture

1. Content intake
   - Track/script submission.
   - Creator metadata.
   - Language, subject, region, station, and class tags.

2. Evidence registry
   - Source, creator, checksum, rights, review state.
   - NULL for unknown values.
   - Fail-closed on missing proof.

3. Editorial console
   - Review queue.
   - Fact-check notes.
   - Sensitive-content flagging.
   - Approval workflows.

4. Playback and packaging
   - Approved sample episode pack.
   - WAV/MP3 deliverables as required.
   - Caption/lyrics/transcript packet.

5. Distribution handoff
   - Only after Prasar Bharati review.
   - Metadata export for Akashvani/WAVES/DD digital teams.

---

## 9. Pilot Deliverables

### Phase 1: Due Diligence Pack, 2 weeks

- 10 sample episode concepts.
- 5 rights-cleared demo audio items, if rights proof is available.
- Metadata schema and evidence registry.
- Risk register.
- Editorial policy map.

### Phase 2: Controlled Prototype, 4 weeks

- Private dashboard demo.
- Station browsing.
- Transcript/lyrics review.
- Human review queue.
- Evidence packet export.

### Phase 3: Review Pilot, 4 weeks

- Approved pilot episode bundle.
- Accessibility packet: transcript, language tags, summaries.
- Rights and creator packet.
- Technical handoff notes.

### Phase 4: Decision Gate, 2 weeks

- Prasar Bharati editorial/technical feedback.
- Go/no-go on public pilot.
- Licensing and procurement path selection.

---

## 10. Commercial and Licensing Model

This proposal does not assume commercial rights. Commercial terms must be separately reviewed and documented.

Possible models:

- Sponsored public-service pilot.
- Content licensing for selected episodes.
- Technology pilot for content evidence and review workflow.
- Co-production of specific public knowledge series.
- WAVES digital experiment, subject to Prasar Bharati policy.

Required before monetization or public release:

- Product-owner rights confirmation.
- Creator agreements.
- Music/audio generation tool commercial license proof, including Suno AI commercial-use documentation where applicable.
- Territory, duration, media, and exclusivity terms.
- Content sourcing approval.
- Legal and editorial clearance.

---

## 11. Financial Projections

### Projection Status

These projections are planning scenarios only. They are not a valuation, revenue guarantee, official Prasar Bharati rate card, advertising commitment, sanctioned budget, or investment advice.

Revenue can begin only after the relevant gates close:

- Rights closure.
- Playback approval.
- Editorial and legal review.
- Commercial advertising / sponsorship compliance.
- Content sourcing or procurement approval.
- Written approval for any public distribution or monetization.

### Prasar Bharati Commercial Fit

The projections assume any revenue-linked activity will be routed through the applicable Prasar Bharati process. Prasar Bharati's Doordarshan Commercial Service page describes centralized revenue collection, agency registration/accreditation, scheduling, billing, reconciliation, and traffic management. AIR's commercial advertising code states that suitability and sale of broadcast time remain under the competent authority and prescribed rates, and that sponsored programming must be clearly identified.

### 90-Day Controlled Pilot Budget Estimate

Currency: INR lakh. Taxes, GST, statutory deductions, travel, studio rental, Prasar Bharati internal costs, and archive licensing are excluded unless explicitly added.

| Cost Line | Estimate | Basis |
|---|---:|---|
| Editorial research and fact-checking | 4.50 | 10-15 pilot scripts, review notes, public-service framing |
| Audio production and post-production | 5.25 | Voice, music edit, mix/master, format delivery for 5-10 cleared samples |
| Engineering and evidence dashboard | 6.00 | Metadata, evidence registry, private demo, export pack |
| Rights, legal, and admin review | 3.50 | Creator records, consent, source verification, licensing review |
| Transcripts, captions, accessibility | 1.50 | Language tags, transcript cleanup, summaries |
| Hosting, storage, QA, demo packaging | 1.25 | Controlled demo hosting and QA only |
| Contingency, 10 percent | 2.20 | Risk buffer |
| Total 90-day pilot estimate | 24.20 | Controlled pilot only |

### Revenue Model Assumptions

Revenue streams are optional and subject to approval:

| Stream | Conservative Assumption | Base Assumption | Upside Assumption |
|---|---|---|---|
| Sponsored public-service capsules | 4 approved slots/month after launch | 8 approved slots/month after launch | 16 approved slots/month after launch |
| Co-production / commissioning | 1-2 modest series packages/year | 3-4 series packages/year | 6-8 series packages/year |
| Digital / WAVES / PPV experiment | NULL unless pilot framework approves | Limited approved digital packs | Multi-pack digital experiment |
| Evidence tooling and training | 1 training cohort/year | 2-3 cohorts/year | 4+ cohorts/year |
| Archive-aware programming | NULL unless archive access is approved | Limited licensed contextual series | Expanded archive-linked series |

### 3-Year Scenario Projection

Currency: INR lakh. Year 1 assumes launch only after gate closure. If gates remain blocked, revenue remains 0 and only approved pilot/development spend should occur.

| Scenario | Year | Revenue | Operating Cost | Contribution | Notes |
|---|---:|---:|---:|---:|---|
| Conservative | 1 | 36 | 32 | 4 | Limited public-service sponsorship/co-production only |
| Conservative | 2 | 72 | 55 | 17 | Regional expansion with strict rights scope |
| Conservative | 3 | 120 | 82 | 38 | Repeatable series model, still modest distribution |
| Base | 1 | 72 | 46 | 26 | 8 approved sponsor/co-production slots/month equivalent |
| Base | 2 | 156 | 90 | 66 | 3-4 series packages plus training/tooling |
| Base | 3 | 300 | 156 | 144 | Multi-station digital programming and evidence workflow services |
| Upside | 1 | 120 | 62 | 58 | Strong pilot conversion and multiple approved content packs |
| Upside | 2 | 300 | 145 | 155 | Multi-language rollout and repeat sponsorship/commissioning |
| Upside | 3 | 600 | 280 | 320 | Scaled public digital catalog with approved commercial model |

### Break-Even Logic

Base break-even after approval can be reached through any one or a mix of:

- 92 approved capsule sponsorship equivalents at INR 0.50 lakh each to cover a Year 1 operating cost of INR 46 lakh.
- 4 approved co-production packages at INR 12 lakh each.
- 2 co-production packages at INR 12 lakh each plus 44 approved capsule sponsorship equivalents at INR 0.50 lakh each.

These are internal planning equivalents only. Actual rates must follow Prasar Bharati's applicable rate cards, advertising code, content sourcing terms, sponsorship approval, and contract terms.

### Unit Economics for Cleared Capsules

| Unit Cost Component | Low | High | Notes |
|---|---:|---:|---|
| Script, research, editorial review | 0.08 | 0.18 | Per 5-12 minute capsule |
| Voice/performance and direction | 0.05 | 0.20 | Depends on talent approval and usage scope |
| Audio edit, mix, mastering | 0.07 | 0.25 | Broadcast/digital specs may change cost |
| Rights/admin/accessibility | 0.04 | 0.12 | Consent, transcript, language metadata |
| Total estimated direct cost per capsule | 0.24 | 0.75 | Excludes fixed technology and legal overhead |

### Financial Gate Controls

| Gate | Release Rule |
|---|---|
| Rights missing | Revenue must remain 0 for that asset |
| Commercial approval missing | Sponsorship/ad revenue must remain 0 |
| Editorial review missing | Public distribution must remain blocked |
| Prasar Bharati rate/terms missing | Use NULL, not assumed rates |
| AI tool commercial license missing | Exclude the asset from monetized packs |

---

## 12. Risks and Controls

| Risk | Control |
|---|---|
| Unclear music rights | Do not release until proof is supplied and reviewed |
| AI-generated content uncertainty | Label AI-assisted content; require human editorial review |
| Overclaiming cultural/history facts | Require citations; NULL unknowns; no unverifiable claims |
| Broadcast compliance | Map all content to Prasar Bharati guidelines before release |
| Public readiness gap | Keep releaseAllowed = 0 until gates pass |
| Data/media confusion | Separate DB metadata from media storage |

---

## 13. Ask from Prasar Bharati

1. Confirm the appropriate submission route: content sourcing, pilot proposal, innovation lab, Akashvani program review, WAVES digital review, or another channel.
2. Share applicable technical delivery requirements for audio, metadata, transcripts, language tagging, and accessibility.
3. Nominate editorial and technical reviewers for a controlled demo.
4. Clarify whether Prasar Bharati is open to an evidence-first AI-assisted content workflow pilot.
5. Provide guidance on archive usage, if any archive-aligned storytelling is desired.

---

## 14. Immediate Next Steps

1. Select 10 candidate episodes.
2. Exclude any item without rights proof.
3. Prepare 5 fully documented sample packets.
4. Generate editorial review forms.
5. Package a private demo link and offline PDF/HTML proposal.
6. Submit through the official channel identified by Prasar Bharati.

---

## 15. Source References

- Prasar Bharati About Us: https://prasarbharati.gov.in/about-us/
- Prasar Bharati Home / Network / Research references: https://prasarbharati.gov.in/
- Prasar Bharati Content Sourcing: https://prasarbharati.gov.in/content-sourcing-policy/
- Prasar Bharati Content Sourcing Policy 2024 PDF: https://prasarbharati.gov.in/wp-content/uploads/2025/02/Content-Sourcing-Policy-2024.pdf
- Prasar Bharati Pay-Per-View Content Sourcing Policy Pilot Framework 2025-26 PDF: https://prasarbharati.gov.in/wp-content/uploads/2025/10/Notification-for-Pilot-PPV-Policy-Framework-2025-26.pdf
- Prasar Bharati Advertisements on DD: https://prasarbharati.gov.in/advertisements-on-dd/
- Prasar Bharati Code for Commercial Advertising: https://prasarbharati.gov.in/code-for-commercial-advertising/

---

## 16. Proposal Integrity Statement

This proposal does not claim broadcast readiness, rights closure, commercial licensing, public release approval, Prasar Bharati endorsement, or production deployment. All such states remain NULL or BLOCKED until supported by written evidence, human review, and applicable legal approval.
