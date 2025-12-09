# Design Guidelines: Current SaaS

## Design Approach
**Hybrid System-Based** - Linear's precision + Notion's warmth for a professional yet approachable SaaS. Marketing pages showcase the product, app interface prioritizes efficiency and trust.

**Core Principles:**
- Information clarity with generous breathing room
- Trust through transparency (diffs, sources, confidence)
- Approachable professionalism balancing tech credibility with warmth

---

## Colors
**Primary Palette:**
- Indigo: `bg-indigo-600` (primary buttons, links), `bg-indigo-50` (subtle backgrounds)
- Blue: `bg-blue-600` (secondary actions), `text-blue-700` (headings)
- Teal/Cyan Accents: `bg-cyan-400` (highlights, badges), `text-cyan-600` (CTAs)

**Supporting Colors:**
- Neutrals: `bg-slate-50/100/200/700/900` for surfaces and text
- Status: `bg-green-500` (approved), `bg-red-500` (rejected), `bg-yellow-500` (pending)
- Backgrounds: `bg-white` (cards), `bg-slate-50` (page backgrounds)

**Application:**
- Primary CTAs: `bg-indigo-600 hover:bg-indigo-700 text-white`
- Secondary buttons: `bg-white border border-slate-300 text-slate-700 hover:bg-slate-50`
- Accent elements: `bg-cyan-400 text-slate-900` for energy pops
- Status indicators: Border-l-4 with status colors

---

## Typography
**Font Stack:** Inter (all weights via Google Fonts CDN)

**Marketing Pages:**
- Hero H1: `text-5xl lg:text-6xl font-bold tracking-tight text-slate-900`
- Section H2: `text-3xl lg:text-4xl font-bold text-slate-900`
- H3: `text-xl lg:text-2xl font-semibold text-slate-900`
- Body: `text-lg text-slate-600 leading-relaxed`
- Labels: `text-sm font-medium text-slate-700 uppercase tracking-wide`

**Application Interface:**
- H1: `text-2xl font-semibold text-slate-900`
- H2: `text-xl font-semibold text-slate-800`
- Body: `text-sm text-slate-700`
- Code/Diffs: `font-mono text-sm text-slate-800`
- Metadata: `text-xs text-slate-500`

---

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16, 20

**Marketing Sections:**
- Vertical spacing: `py-20 lg:py-32` between major sections
- Container: `max-w-7xl mx-auto px-6 lg:px-8`
- Cards: `p-8 gap-6`

**App Interface:**
- Dashboard: 256px fixed sidebar + main content (`max-w-6xl mx-auto p-8`)
- Approval cards: `p-6 gap-4`
- Dense lists: `p-4 gap-2`

---

## Component Library

### Marketing Components

**Hero Section:**
- Full-width `bg-gradient-to-b from-indigo-50 to-white`
- Two-column: Left text block (`max-w-xl`), right hero image
- Headline + subheadline + dual CTAs (primary indigo, secondary white with border)
- Trust indicators below CTAs: "Trusted by 500+ teams" with logos

**Feature Cards:**
- 3-column grid: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Each card: Icon (cyan circle bg), title, description, subtle border
- Hover: `hover:shadow-lg transition-shadow`

**Social Proof Section:**
- Background: `bg-slate-50`
- Testimonial cards: 3-column grid with customer quote, avatar, name/title
- Stats bar: 4 metrics in horizontal row with large numbers (`text-4xl font-bold text-indigo-600`)

**Pricing Tiers:**
- 3-column comparison: `border rounded-xl p-8`
- Featured tier: `border-2 border-indigo-600 shadow-xl`
- Price: `text-5xl font-bold` + billing cycle `text-slate-600`

**CTA Section:**
- Centered content: `max-w-3xl mx-auto text-center`
- Background: `bg-gradient-to-r from-indigo-600 to-cyan-500`
- White text with high contrast
- Single primary button: `bg-white text-indigo-600 hover:bg-slate-100`

### Application Components

**Approval Cards:**
- Structure: `border-l-4` status stripe + `bg-white shadow-sm rounded-lg p-6`
- Header: Source badge + knowledge type tag + timestamp
- Content: Proposed change with confidence score progress bar
- Diff preview: Side-by-side with `bg-green-50/bg-red-50` highlighting
- Actions: Approve (indigo) + Reject (slate) buttons, right-aligned

**Dashboard Sidebar:**
- Fixed `w-64 bg-slate-900 text-white`
- Nav items: `hover:bg-slate-800 px-4 py-3 rounded-lg`
- Badge counts: `bg-cyan-400 text-slate-900 px-2 py-1 rounded-full text-xs`

**Activity Feed:**
- Timeline with vertical connecting line (`border-l-2 border-slate-200`)
- Action icons in circle backgrounds (approved=green, rejected=red, pending=yellow)
- Grouped by date with `text-xs text-slate-500 uppercase` date headers

**Filter Bar:**
- Horizontal flex layout: `flex gap-4 items-center`
- Dropdowns and slider with `border border-slate-300 rounded-lg`
- Active filters: Removable chips with `bg-indigo-100 text-indigo-700`

---

## Images

**Hero Section Image:**
- Placement: Right half of hero (desktop), full-width above text (mobile)
- Content: Dashboard screenshot or abstract illustration of AI processing knowledge
- Style: Modern, clean UI mockup with slight perspective tilt
- Treatment: `rounded-2xl shadow-2xl` with subtle border

**Feature Section Images:**
- Screenshot mockups showing diff viewer, approval flow, activity timeline
- Placed alongside or within feature descriptions
- Treatment: `rounded-xl border border-slate-200 shadow-lg`

**Social Proof:**
- Customer avatars: `rounded-full w-12 h-12` next to testimonials
- Company logos: Grayscale, evenly spaced in trust bar

---

## Animations
**Purposeful Only:**
- Button hovers: `transition-all duration-200`
- Card hovers: `hover:shadow-lg transition-shadow`
- Pulse on processing badges: `animate-pulse`
- Toast slide-ins: `transition-transform duration-300`
- NO scroll animations, minimal motion overall

---

## Accessibility
- All interactive elements: Clear focus rings `focus:ring-2 focus:ring-indigo-500`
- Color contrast: Minimum WCAG AA for all text
- Keyboard shortcuts displayed in tooltips
- ARIA labels on all status indicators and icon buttons