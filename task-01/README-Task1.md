# HH Goa 2026 — Builder ID Card Generator (Task 01)

A single-page, zero-login web application where builders upload their photo, fill in their details, and generate a shareable **HH Goa 2026 Builder ID Card**.

---

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 5
- **Image Cropping:** `react-easy-crop`
- **HEIC Image Conversion:** `heic2any`
- **Animations:** `canvas-confetti`
- **Styling:** CSS Custom Properties (Design System tokens)
- **Fonts:** Space Grotesk & Inter (via Google Fonts)

---

## 📁 Project Structure

```text
task-01/
├── DesignDoc.md              # Detailed Product & Architecture Design Document
├── index.html                # Main HTML template with Google Fonts
├── package.json              # Dependencies and NPM scripts
├── vite.config.js            # Vite configuration
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Main state machine (upload -> crop -> form -> result)
    ├── index.css             # Global styles and resets
    ├── styles/
    │   └── tokens.css        # Design system CSS variables (colors, typography)
    ├── components/
    │   ├── Uploader.jsx      # Photo upload component (JPG, PNG, HEIC)
    │   ├── Cropper.jsx       # 3:4 aspect ratio photo cropping component
    │   ├── FormFields.jsx    # Builder information form
    │   └── ResultScreen.jsx  # Card preview and export actions
    ├── hooks/                # Custom hooks (image processing, card rendering)
    ├── utils/                # Utility helpers
    └── assets/               # Logos and static assets
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

---

## 🛠️ How to Run Locally

1. **Navigate to the `task-01` directory:**

   ```bash
   cd task-01
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Start the development server:**

   ```bash
   npm run dev
   ```
4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📜 Available Scripts

In the `task-01` directory, you can run:

- `npm run dev` — Starts the Vite development server with HMR.
- `npm run build` — Builds the application for production into the `dist/` folder.
- `npm run preview` — Locally previews the production build.

---

## 📌 Implementation Progress

- [X]  **Phase 0:** Project Scaffold & Multi-step State Machine Architecture
- [X]  **Phase 1:** Upload & Client-side HEIC Conversion
- [X]  **Phase 2:** Crop & Framing UI
- [X]  **Phase 3:** Form Fields & Builder Title Selection
- [X]  **Phase 4:** HTML5 Canvas ID Card Rendering
- [ ]  **Phase 5:** Reveal Animation & PNG Download
- [ ]  **Phase 6:** Share to X (Twitter Web Intent)
- [ ]  **Phase 7:** Mobile Polish & Safe Area Adjustments
