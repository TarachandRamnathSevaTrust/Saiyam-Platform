# Saiyam Platform (संयम व्यासपीठ)
### Adolescent Anti-Addiction & Wellbeing Ecosystem
**An Initiative by Tarachand Ramnath Seva Trust (TRST) in partnership with Jnana Prabodhini (JPIP)**

---

## 🚀 Overview

The **Saiyam Platform** is an enterprise-grade digital ecosystem replacing the legacy paper-entry and manual spreadsheet workflow used in the Saiyam school-based preventive education initiative.

It synchronizes:
1. **Field Trainer App (Mobile & Web):** For trainers visiting schools to register cohorts (S-1, S-2... sequential paper bundle mapping), log 25 curriculum sessions with attendance and media proofs (photos, audios, videos), and enter Pre/Post assessment responses for the 3 psychometric papers (**MKMH**, **MMAT**, **ERT**).
2. **Trust Executive Portal (Web):** For TRST administrators to monitor field operations across Pune, provision trainer accounts, audit session proofs, and automatically compute Pre-to-Post improvement deltas without manual Excel calculations.

---

## 🛡️ DPDP Act (India, 2023) Compliance & Play Store Readiness

- **Data Minimization:** No unnecessary student PII (no phone numbers, addresses, or Aadhaar). Records are indexed by school, standard, division, and physical paper bundle serial token (`S-1`, `S-2`...).
- **Row-Level Security (RLS):** Enforced natively inside PostgreSQL. Field trainers can only access their assigned schools and cohorts.
- **Institutional Consent:** Headmaster request letter and stamped final sheet serve as verified institutional consent under Section 9 of the DPDP Act.
- **Play Store Ready:** Configured as an educational field productivity tool (`org.trst.saiyam`) with on-demand camera/audio permissions and privacy declarations.

---

## 📁 Repository Structure

```
Saiyam Platform/
├── packages/
│   └── shared/                 # Core domain logic shared across Web & Mobile
│       ├── src/
│       │   ├── types.ts        # TypeScript definitions (Schools, Students, Papers, Logs)
│       │   ├── questions.ts    # Pre-seeded MKMH, MMAT, ERT questions (Marathi & English)
│       │   ├── scoring.ts      # Automated Pre-vs-Post Delta & Impact calculation engine
│       │   └── index.ts
├── supabase/
│   ├── migrations/
│   │   └── 20261117_initial_schema.sql  # Complete PostgreSQL schema with RLS policies
│   └── seed.sql                         # Pre-seeded 25 sessions & standard test questions
├── web/                        # Web Platform (Trust Admin + Field Trainer)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin Dashboard, Pre-Post Delta Engine, Media Audit
│   │   │   ├── trainer/        # School Add, Student Roster, 3 Papers Entry, 25 Sessions Log
│   │   │   └── layout/         # Header with Role Switcher (Admin ↔ Trainer) & Lang toggle
│   │   ├── context/            # React state & Excel exporter engine
│   │   └── lib/                # Supabase client & initial data
│   └── package.json
└── mobile/                     # React Native / Expo App (iOS & Android Play Store)
    ├── app.json                # Android package org.trst.saiyam & iOS bundle config
    └── package.json
```

---

## ⚡ Quick Start: Running the Web Platform

1. Navigate to the `web` folder:
   ```bash
   cd web
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

---

## 🌟 Key Upgrades Over the Legacy System

1. **Fixed Answer Selection Bug:** In the old app, once an option was clicked, it could not be unselected or cleared. The new platform allows toggling, clearing, and leaving blank responses freely.
2. **Automated Impact Engine:** Replaces hours of manual VLOOKUP and spreadsheet calculations by automatically correlating Pre and Post test sheets and computing the improvement percentage.
3. **One-Click Consolidated Excel Export:** Exports clean, pre-calculated `.xlsx` spreadsheets for reporting to trust trustees, government stakeholders, and donors.
4. **Bilingual Support:** Full Marathi (मराठी) and English support matching the official *संयम सत्रांचा आराखडा संच* manual.
