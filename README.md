# Human–Wildlife Conflict in Ireland: Survey Repository

## Overview  
This repository hosts the code and materials for a survey examining human–wildlife conflict on the island of Ireland, with a focus on pine martens (Martes martes) and red foxes (Vulpes vulpes).  

This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.

---

## Researcher Details  
**Name:** Leighanna Teal Dawson  
**Institution:** Ulster University  
**Department:** School of Geography and Environmental Sciences  
**Position:** PhD Researcher 
**Email:** teal_dawson-l@ulster.ac.uk

---

## Survey Description  

The survey collects information on:  
- Wildlife interactions (pine martens and foxes)  
- Public attitudes towards predators  
- Perceived risks and tolerance  
- Seasonal patterns of interactions  
- Demographic information  

The survey is structured into four sections:  
1. Wildlife Interactions  
2. Perceptions of Predators  
3. Demographics  
4. Additional Comments  

---

## Aims and Objectives  

This study aims to investigate human-wildlife conflict implicating foxes (Vulpes vulpes) and pine martens (Martes martes) on the island of Ireland. It seeks to:  

1) Investigate public attitudes towards foxes and pine martens, including perceived risks and tolerance.  
2) Quantify and categorise interactions with these species by type and intensity, and examine associated public perceptions  
3) Investigate seasonal variation in negative interactions among conflict types  
4) Assess the influence of geographical and landscape factors on perceptions of human-wildlife conflict.  

---

## How This Repository Works  

This project is a web-based survey built using a modern frontend framework (Vite, TypeScript, Tailwind CSS).  

### Structure  
- `src/` – Main survey application (questions, logic, UI)  
- `public/` – Static assets  
- `docs/` – Documentation (if applicable)  
- `scripts/` / `server/` – Supporting scripts for deployment or processing  
- `.github/workflows/` – GitHub Actions for deployment  

### Core Folders  

- `src/`  
  The main working directory of the project.  
  This contains the survey itself, including:
  - Question structure  
  - Conditional logic  
  - Form handling  
  - User interface components  

- `public/`  
  Stores static assets that are served directly (e.g. images, icons).  

- `docs/`  
  Contains documentation files for the project (e.g. README, supporting materials).  

- `.github/workflows/`  
  Contains GitHub Actions workflows used for automated deployment (e.g. publishing the survey to GitHub Pages).  

---

### Key File Types  

- `.tsx` (TypeScript React files)  
  These are the most important files in the project.  
  They define:
  - The survey layout  
  - Questions and inputs  
  - Interactive behaviour  
  - Conditional logic (e.g. showing questions based on answers)  

- `.ts` (TypeScript files)  
  Used for:
  - Helper functions  
  - Data handling  
  - Submission logic (e.g. sending responses to Google Sheets)  

- `.css`  
  Styling files used to control layout, colours, and appearance.  
  Tailwind CSS is used, so many styles are applied directly in `.tsx` files using utility classes.  

- `.html`  
  The main entry point of the web app (usually `index.html`).  
  This is where the app is mounted and loaded in the browser.  

---

### Configuration Files  

- `vite.config.ts`  
  Configures how the project is built and served locally.  

- `tailwind.config.ts`  
  Controls Tailwind CSS settings (theme, colours, etc.).  

- `tsconfig.json`  
  Defines how TypeScript compiles the code.  

- `package.json`  
  Lists project dependencies and scripts.  
  Common commands:
  - `npm run dev` → run locally  
  - `npm run build` → create production build  

- `package-lock.json`  
  Locks dependency versions to ensure consistent installs.  

---

### How Data Submission Works  

Survey responses are handled in the code (usually within `.ts` or `.tsx` files):  

1. User completes the survey  
2. A submission function collects responses  
3. Data is sent to a connected service (Google Sheets)  
4. Responses are stored in **“Living with Predators Survey Responses”**  

---

### How to Navigate the Project  

If you want to:  

- **Edit questions** → go to `src/` and find the survey component (`.tsx`)  
- **Change logic (e.g. conditional questions)** → look for functions or state handling in `.tsx` files  
- **Fix data submission** → find the function sending data (likely in `.ts` or `.tsx`)  
- **Change styling** → edit Tailwind classes in `.tsx` or config in `tailwind.config.ts`  
- **Deploy changes** → push to GitHub (handled by workflows)  

---

**How it works (briefly):**  
- Users complete the survey via the deployed webpage  
- Responses are submitted through a form integration/API  
- Data is securely stored in the connected Google Sheet  
- No personally identifiable information is collected  

---

## Ethics and Participation  

Participation in this study is entirely voluntary. You may withdraw from the survey at any time prior to submitting your responses, for any reason. Once the survey has been submitted, all responses are fully anonymous and cannot be withdrawn.  

By submitting this survey, you indicate your consent for your responses to be used for scientific research purposes. All data collected are anonymous and confidential and may be used in academic publications, reports, and presentations. No personally identifiable information will be collected or stored.  

Participants are asked to respond honestly and to the best of their ability. There are no right or wrong answers.  

This research has received full ethical approval from Ulster University and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.  

By proceeding with this survey, you confirm that you are 
- Aged 18 years or over
- That you have read and understood the information provided
- Reside on the island of Ireland.  

---

## Development  

To run the project locally:

```bash
npm install
npm run dev