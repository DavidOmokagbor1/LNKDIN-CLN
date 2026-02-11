# LNKDIN Clone — Professional Network Engine

**Project:** Professional Network Engine  
**Owners:** Gamaliel Leguista & David Omokagbor  
**Date:** February 7, 2026

A professional social network centered on verified identity, an algorithmic feed, and connection-based networking—with ad monetization. Built with React 18, Vite, TailwindCSS, React Router v6, Zustand, and Lucide React.

---

## Revenue Model: How LinkedIn Generates Money

LinkedIn (and this clone) monetizes primarily through **ads and promotions**:

- **Sponsored Content** — Companies pay to promote posts (hiring, brand awareness, events) into users’ feeds. Charged per impression (CPM) or per click (CPC).
- **Job Ads** — Recruiters and employers pay to feature job listings, target by industry/location, and reach passive candidates.
- **Sponsored InMail** — Paid messaging to prospects outside your network (Recruiter Lite/Premium).
- **Premium Subscriptions** — LinkedIn Premium, Sales Navigator, Recruiter add subscription revenue on top of ad spend.
- **Learning (Lynda)** — Course and certification upsells.

In this app, the **Ad Studio** (`/ads`) and **feed ad slots** simulate this model: advertisers run campaigns, target audiences, and pay for impressions/clicks while the platform earns revenue.

---

## Problem

Professionals lack a centralized, "always-on" digital identity that separates their personal lives from their career growth. Traditional resumes are static and "dead" documents, making it difficult for recruiters to find active talent and for peers to share knowledge or opportunities in a trusted, high-signal environment.

## Opportunity

Create a global professional "town square" where identity is verified by work history and social proof.

**Market opportunity:** The global recruitment and professional networking market continues to shift toward "passive" candidate sourcing and creator-led professional branding.

---

## Users & Needs

| User type | Description |
|----------|-------------|
| **Primary** | Job seekers and active professionals building "thought leadership" |
| **Secondary** | Recruiters and hiring managers looking for qualified leads |

**Key user needs:**

- As a **professional**, I need to maintain a live digital profile so that I am discoverable for opportunities without manually sending out PDFs.
- As a **content consumer**, I need a feed of industry-specific news in order to stay competitive in my field.
- As a **networker**, I need a way to "connect" with others that feels more formal than a "friend request" but less cold than an email.

---

## Proposed Solution

A professional social network centered around:

1. **User Profile (The Resume)** — Robust, searchable professional identity.
2. **Algorithmic Feed (The Knowledge Exchange)** — Industry-relevant content and engagement.
3. **Connection Request Logic (The Gatekeeper)** — Structured networking (connect, accept, ignore).

A "work-first" ecosystem where every interaction adds to a user's professional credibility.

### Top 3 MVP Value Props

| Type | Value prop |
|------|------------|
| **The Vitamin** | A searchable digital profile that serves as a permanent professional URL. |
| **The Painkiller** | One-click networking that bypasses the need for personal email or phone numbers. |
| **The Steroid** | The Feed algorithm that can push a user's professional insight to thousands of industry peers instantly. |

---

## Goals & Non-Goals

**Goals:**

- Enable users to build a complete professional profile (Experience, Education, Skills).
- Facilitate the growth of a 1st-, 2nd-, and 3rd-degree network.
- Provide a functional "Home Feed" for posting text, images, and links.

**Non-Goals:**

- Real-time video conferencing (Zoom-like features).
- Personalized "marketplace" for physical goods (Facebook Marketplace style).
- Advanced "Recruiter Seat" analytics (separate PRD/Module).

---

## Success Metrics

| Goal | Signal | Metric | Target |
|------|--------|--------|--------|
| **Engagement** | Users find value in the feed | Weekly Active Users (WAU) | >30% of Registered |
| **Network density** | Users are connecting | Avg. Connections per User | 15 within first 30 days |
| **Profile strength** | Users are completing profiles | % of "All-Star" Profiles | >40% of users |

---

## Requirements (Use Cases)

### Use Case 1: Building a Professional Identity

*Context: The profile is the "Proof of Work." It must be structured enough for data parsing but flexible enough for personal branding.*

**Profile setup**

- **[P0]** User can add/edit work experience (Title, Company, Dates, Description).
- **[P0]** User can upload a professional profile photo and header image.
- **[P1]** User can list "Skills" and receive endorsements from connections.
- **[P2]** User can record a "Name Pronunciation" audio clip or "Profile Video."

### Use Case 2: Networking & Connections

*Context: Managing the "Social Graph." We need to distinguish between people you know and people you want to follow.*

**Building the graph**

- **[P0]** User can send a "Connect" request to another user.
- **[P0]** User can "Accept" or "Ignore" incoming requests.
- **[P1]** User can add a custom note to a connection request to provide context.
- **[P1]** User can "Follow" a high-profile user without being a 1st-degree connection.

### Use Case 3: Content Consumption & Interaction

*Context: Keeping users coming back daily. The feed must surface relevant professional content.*

**The feed**

- **[P0]** User can create a post (Text, Image, URL).
- **[P0]** User can "Like," "Comment," or "Repost" (Share) a post.
- **[P1]** Feed algorithm prioritizes posts from 1st-degree connections and "trending" topics in the user's industry.
- **[P2]** User can "Save" a post to read later.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6, Zustand, Lucide React |
| **Backend** (planned) | Node.js / Python |
| **Graph / connections** (planned) | Graph Database (e.g. Neo4j) |

**Current app:**

- **React 18** + **Vite**
- **TailwindCSS** — LinkedIn-inspired palette (Primary Blue `#0A66C2`, Dark Blue `#004182`, Light Gray `#F3F2F0`, etc.)
- **React Router v6** — Home, Profile, Network, Jobs, Messaging, Notifications, Ad Studio
- **Zustand** — auth, feed, and ad stores
- **Lucide React** — icons
- **Ad monetization** — Ad Studio, feed ad slots, targeting & analytics utilities

---

## Project Structure

```
src/
├── components/
│   ├── common/
│   ├── feed/
│   ├── profile/
│   ├── ads/
│   └── navigation/   (NavBar)
├── pages/
│   ├── Home.jsx
│   ├── Profile.jsx
│   ├── Network.jsx
│   ├── Jobs.jsx
│   ├── Messages.jsx
│   ├── Notifications.jsx
│   └── AdStudio.jsx
├── store/   (authStore, feedStore, adStore)
├── data/    (users, posts, connections, ads, campaigns)
├── utils/   (adTargeting, analytics, helpers)
├── App.jsx
└── main.jsx
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Scripts**

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint

---

## Appendix

- **Designs:** [Link to Figma/Wireframes]
- **Tech stack (full):** React frontend, Node.js/Python backend, Graph Database (Neo4j) for connections.
