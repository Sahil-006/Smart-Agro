# Smart-Agro Frontend UI & Design System Specification

> **Purpose:** This document provides a complete, architectural, and visual blueprint of the Smart-Agro web platform. Any AI model, designer, or developer reading this document will understand the aesthetic identity, user interface components, color tokens, layout hierarchy, and user experience patterns across all 13 routes and states.

---

## 1. Design Philosophy & Visual Aesthetic

Smart-Agro blends modern **"Clean Eco-Tech"** with **Apple-style Glassmorphism**:
- **Atmosphere:** Clean, open, natural, and technologically advanced. It avoids cluttered agricultural looks in favor of a crisp, modern SaaS product aesthetic.
- **Surface Elevation (Glassmorphism):** Heavy use of translucent cards (`bg-white/80`, `backdrop-blur-md`), hairline borders (`border border-gray-100` or `border-white/40`), and soft diffused shadows (`shadow-sm`, `shadow-xl`, `shadow-green-100`).
- **Rounded Corners:** Generous rounding matching iOS conventions (`rounded-2xl` for cards, `rounded-3xl` for modals and heroes, `rounded-full` for badges and action pills).
- **Interactive Micro-Animations:** Motion powered by Framer Motion and AOS (Animate on Scroll). Hover states feature gentle lifts (`hover:-translate-y-1`), scale nudges (`active:scale-98`), and subtle color glows.

---

## 2. Design Tokens & Styling Rules

### 2.1 Color Palette

| Token Role | Hex / Tailwind Class | Visual Purpose |
| :--- | :--- | :--- |
| **Primary Brand Green** | `#16a34a` / `text-green-600`, `bg-green-600` | Primary CTA buttons, key active icons, active navigation tabs, brand accents. |
| **Deep Forest Green** | `#15803d` / `text-green-700`, `bg-green-700` | Section headings, strong emphasized titles, hero accents. |
| **Soft Mint Surface** | `#f0fdf4` / `bg-green-50`, `bg-emerald-50/60` | Card active highlights, tag backgrounds, notification containers. |
| **Canvas Background** | `#f8fafc` &rarr; `#f0fdf4` gradient | Dual-tone subtle background gradients across pages (`from-slate-50 to-green-50/30`). |
| **Glass White** | `rgba(255, 255, 255, 0.85)` / `bg-white/80 backdrop-blur-md` | Floating navbar, metric cards, modal overlays. |
| **Border Highlights** | `border-gray-100`, `border-white/40` | Subtle specular borders creating the frosted-glass edge. |
| **Text Primary** | `#1f2937` / `text-gray-800` | Main titles, user input values, primary prose. |
| **Text Muted** | `#6b7280` / `text-gray-500`, `text-gray-400` | Labels, helper texts, metadata timestamps, input placeholders. |
| **Status Warning / Solar** | `#eab308` / `text-yellow-600`, `bg-yellow-50` | Solar irradiance, heat alerts, moderate risks. |
| **Status Critical** | `#ef4444` / `text-red-600`, `bg-red-50` | Severe crop disease alerts, validation errors, disconnect states. |

### 2.2 Typography
- **Heading 1 / Hero:** `text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight`
- **Heading 2 / Section:** `text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 text-center mb-8 sm:mb-14`
- **Heading 3 / Card Titles:** `text-lg sm:text-xl font-bold text-gray-800`
- **Body & Paragraphs:** `text-base sm:text-lg text-gray-600 leading-relaxed`
- **Labels & Micro-copy:** `text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400`

---

## 3. Global Navigation & Layout Shell

### 3.1 Floating Navbar (`navbar.jsx`)
- **Desktop (>= 768px):** A floating, pill-shaped frosted glass bar fixed at the top center (`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl bg-white/70 backdrop-blur-lg border border-white/40 rounded-full px-6 py-3 shadow-lg`).
  - **Left:** Brand logo with glowing green leaf icon + bold `Smart-Agro` typography.
  - **Center:** Navigation links (`Home`, `Dashboard`, `About Us`, `Contact`) with subtle hover pill effects.
  - **Right:** Multi-language Switcher dropdown + Auth action (Login/Signup pills, or User Avatar pill with dropdown).
- **Mobile (< 768px):** 
  - Floating top bar contains Brand Logo, Language Switcher, and a dedicated 44x44px Hamburger icon (`lucide-react: Menu / X`).
  - Tapping the hamburger opens an accessible, smooth **Full-Screen Slide-Down Drawer** (`bg-white/95 backdrop-blur-xl`) with staggered animated links, tap-dismiss backdrop, and Escape key listener.

### 3.2 Language Switcher (`LanguageSwitcher.jsx`)
- Compact pill button with globe icon (`FaGlobe`) displaying active language code (`EN`, `HI`, `GU`).
- Translucent dropdown menu supporting:
  - 🇺🇸 English
  - 🇮🇳 हिंदी (Hindi)
  - 🇮🇳 ગુજરાતી (Gujarati)
- Active selection is highlighted with a soft green badge and checkmark (`✓`).

### 3.3 Universal Footer (`footer.jsx`)
- Deep green and slate gradient container.
- 4-column responsive grid on desktop stacking into 1 column on mobile:
  1. Brand bio and mission.
  2. Quick navigation links.
  3. Technology stack (IoT, AI Vision, Solar Sensing).
  4. Social links (GitHub, LinkedIn, Instagram) and copyright notice.

---

## 4. Page Architecture & Screen Anatomy

```
Smart-Agro
├── Public / Marketing
│   ├── / (Landing Page)
│   ├── /AboutUs (Team, Mission, Milestones)
│   └── /Contact (Feedback Form & Physical Office Details)
├── Authentication Flow
│   ├── /login (Credentials + Google + GitHub)
│   ├── /signup (Multi-step Location + Password Strength)
│   ├── /forgot-password (Identifier Lookup & Email Reset)
│   └── /reset-password (Token Validation & New Password)
├── Core Application (Protected / Interactive)
│   ├── /Dashboard (Telemetry Cards, AI Leaf Detection, Action Center)
│   ├── /profile (Avatar Upload, Personal Data, Password Change)
│   └── /insights/* (Deep-Dive Analytics)
│       ├── /insights/soil (Moisture Trends & Soil Nutrition)
│       ├── /insights/solar (PV Yield & Battery Storage)
│       ├── /insights/crop (Health Index & Disease Forecasting)
│       └── /insights/system (IoT Node Health & Telemetry Logs)
```

---

### 4.1 Landing Page (`/`)
- **Hero Section:** Split 2-column layout (stacks on mobile).
  - *Left:* Tagline badge (`"Smart Farming for a Sustainable Future"`), high-impact title (`"AI-Powered Agriculture & Solar Monitoring"`), supporting text, and dual CTAs:
    - Primary CTA: Solid green rounded-full button (`"Explore Dashboard"` &rarr;).
    - Secondary CTA: Outline pill button (`"Learn More"`).
  - *Right:* Glowing frosted-glass container housing the animated Lottie logo (`AnimatedLogo.jsx`) with responsive bounding box (`220px` to `340px`).
- **Key Features Grid:** 4-card interactive grid (Leaf Disease Diagnosis, Smart Irrigation, Solar Energy Optimization, Comprehensive Insights) with large centered Lucide icons, bold titles, and subtle card hover elevations.
- **Full-Width CTA Banner:** Deep green gradient banner with drop-shadow typography inviting farmers to register.

---

### 4.2 Dashboard (`/Dashboard`) — The Product Heart
The Dashboard provides the farmer with real-time operational control:

1. **Header & Live Time:** Welcomes user by name, displays farm location badge (`District, State`), and current sync timestamp.
2. **Top Metric Cards Row (4 Cards):**
   - **Soil Moisture:** Percent gauge, color badge (Blue/Green for optimal, Amber for dry).
   - **Temperature:** Celsius readout with thermometric icon (`🔥` / `❄️`).
   - **Humidity:** Ambient moisture level.
   - **Solar Radiation:** Photovoltaic irradiance ($W/m^2$) & estimated energy output ($kW$).
3. **AI Leaf Disease Detection Studio (Split Card):**
   - *Upload Zone:* Drag-and-drop / click-to-upload area with leaf dashed border, accepting `.png`, `.jpg`, `.jpeg`. Shows live image preview with a 1-click removal cross (`X`).
   - *Diagnostic Results Card:*
     - Displays predicted disease name (e.g. `Tomato___Late_blight`).
     - Confidence meter (percentage progress bar).
     - Color-coded risk status badge (`Critical`, `Moderate`, `Healthy`).
     - Tabbed recommendation accordions: **Immediate Treatments** (chemical/fungicidal recipes) and **Long-term Prevention** (sanitation, crop spacing).
4. **Automated Agronomic Suggestions Feed:** Real-time AI advisory cards based on incoming sensor readings (e.g., *"💧 Soil moisture low: Irrigation valve triggered for 20 mins"*).

---

### 4.3 Deep-Dive Insights Pages (`/insights/*`)
Clean analytical dashboards featuring **Chart.js** telemetry graphs:
- **Soil Insights:** Interactive line charts plotting moisture fluctuations over 24 hours vs automated irrigation triggers.
- **Solar Insights:** Area charts visualizing solar peak sunlight hours vs agricultural power generation.
- **Crop Insights:** Radar and bar charts scoring vegetative index and plant health status across crop zones.
- **System Insights:** Technical diagnostics for hardware engineers (Raspberry Pi socket status, ping latency, memory, sensor read errors).

---

### 4.4 Authentication Pages (`/login`, `/signup`, etc.)
- **Card Format:** Glassmorphic modal centered on screen over a gradient backdrop (`max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl`).
- **Header:** Leaf icon badge with bilingual greeting.
- **Social Auth Row:**
  - Official Google One-Tap / OAuth button with standard branding.
  - GitHub dark icon button with hover inversion.
- **Divider:** Elegant `"OR"` hairline separator.
- **Form Controls:** 
  - Inputs have embedded leading Lucide icons (`User`, `Mail`, `Lock`, `Phone`, `MapPin`).
  - Active focus ring (`focus:border-green-500 focus:ring-4 focus:ring-green-100`).
  - Password fields include a toggle eye icon (`Eye` / `EyeOff`) with touch targets $\ge 44 \times 44\text{px}$.
  - **Signup Special:** Multi-tier location dropdowns (State, District, Village) specifically tailored to Indian agricultural regions.
  - **Live Password Strength Meter:** Real-time checklist showing 5 checks (8+ characters, uppercase, lowercase, number, special symbol) with animated green checkmarks (`CheckCircle2`).

---

### 4.5 User Profile (`/profile`)
- **Avatar Hero:** Large rounded-3xl profile image container with primary green fallback initial (`A`, `S`), camera overlay badge for uploading new avatars, and live file upload handler.
- **Personal Information Grid:** 2-column grid of glass cards showing user metadata:
  - Editable: Full Name, Phone Number, State, District, Village.
  - Static: Email address (provider-locked), Account Creation Date.
- **Action Toolbar:** "Edit Profile" toggle switching view to interactive input lines, "Save Changes", and "Change Password" modal trigger.
- **Password Change Modal:** Internal glass modal with current password check and new password confirmation.

---

### 4.6 About Us & Contact Pages
- **About Us (`/AboutUs`):**
  - Mission & Vision statement cards with leaf badges.
  - Interactive Project Milestones Timeline with scroll-triggered fade animations.
  - Core Pillars: Artificial Intelligence, IoT Automation, Clean Solar Energy.
  - Team Cards: Profile pictures of creators with social pills and project roles.
- **Contact (`/Contact`):**
  - *Left Info Cards:* Phone numbers, support email (`sahil06052005@gmail.com`), physical coordinates, and farm hours.
  - *Right Feedback Form:* Full name, email, query text area, and full-width green submit button with loading spinner.

---

## 5. Responsive Behavior & Viewport Standards

All layouts strictly adhere to mobile-first responsive architecture:

```
[320px - 480px]       [481px - 768px]        [769px - 1024px]        [1025px - 1440px+]
Small Phones          Large Phones/Phablets  Tablets / Laptops       Desktop & Ultrawide
-----------------     ---------------------  -----------------       -------------------
1 Column layout       1-2 Column grids       2-3 Column grids        3-4 Column grids
Slide-down Drawer     Slide-down Drawer      Floating Navbar         Floating Navbar
Full-width inputs     Fluid inputs           Standard inputs         Standard inputs
44px Touch Targets    44px Touch Targets     Mouse hover states      Mouse hover states
```

- **0px Horizontal Overflow Guarantee:** No screen between 320px and 1920px triggers horizontal scrollbars.
- **Safe Area Insets:** Margins respect device notches (`env(safe-area-inset-top)`).
- **Dynamic Viewport Height:** Uses `100dvh` for full-height views to avoid mobile browser navigation bar jumps.

---

## 6. How to Generate Matching UI Code (Rules for AI)

When asking an AI to create new components or pages for Smart-Agro, tell it to follow these rules:

1. **Card Container:**
   ```jsx
   <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300">
     {/* Card content */}
   </div>
   ```
2. **Primary Action Button:**
   ```jsx
   <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 min-h-[44px] rounded-full shadow-lg shadow-green-200 transition-all active:scale-98 cursor-pointer">
     <span>Action Text</span>
     <ArrowRight size={18} />
   </button>
   ```
3. **Form Input with Icon:**
   ```jsx
   <div className="relative">
     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
     <input 
       type="email" 
       className="w-full pl-11 pr-4 py-3 min-h-[44px] text-base bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
       placeholder="Enter your email"
     />
   </div>
   ```
4. **Status Pill / Badge:**
   ```jsx
   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
     Optimal Health
   </span>
   ```
