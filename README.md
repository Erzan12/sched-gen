# SchedGen 🗓️✨

> A Generative UI assistant that turns natural-language requests into live, interactive meeting/call schedules — powered by free LLMs.

**Author:** Earl Jan Do ("Erzan")

---

## 💡 What is this?

SchedGen lets a user type something like:

> "Schedule a call with Maria next Tuesday at 3pm to discuss the Q3 report"

...and the AI:
1. Parses the intent and extracts structured meeting data (title, date, time, attendees, notes)
2. Calls a registered **action** (tool call) instead of just replying with text
3. The frontend **generates UI on the fly** — a live meeting card that fills in as the model reasons, plus a confirm/edit step before the meeting is "created"

This is the **Generative UI** pattern: instead of a chatbot that only returns text, the LLM's tool calls directly drive what renders on screen.

---

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| UI framework | **CopilotKit** (`@copilotkit/react-core`, `@copilotkit/react-ui`) | Built-in support for actions → generative UI rendering |
| Frontend | **Next.js (App Router) + React + TypeScript** | Pairs naturally with CopilotKit's runtime |
| Styling | Tailwind CSS | Fast iteration on custom meeting-card UI |
| LLM provider | **Groq API** (Llama 3.3 70B or similar) | Free, fast (LPU inference), reliable native tool-calling |
| Fallback/alt LLM | **OpenRouter free models** (e.g. `openrouter/free` router) | Backup option if Groq rate limits are hit |
| Date logic | `date-fns` | Deterministic date math — kept out of the LLM's hands |
| Deployment (optional) | Vercel (frontend) | Free tier is enough for a demo project |

---

## 📁 Project Structure (planned)

```
schedgen/
├── app/
│   ├── api/
│   │   └── copilotkit/
│   │       └── route.ts        # CopilotKit runtime endpoint (calls Groq)
│   ├── page.tsx                # Main chat + scheduling UI
│   └── layout.tsx
├── components/
│   ├── MeetingCard.tsx         # Generative UI: live-rendered meeting draft
│   └── CopilotSidebar.tsx      # Chat panel
├── lib/
│   ├── groq.ts                 # Groq client config
│   └── meetingUtils.ts         # date-fns based scheduling/conflict logic
├── actions/
│   └── createMeeting.ts        # useCopilotAction definition
├── .env.local                  # API keys (not committed)
├── package.json
└── README.md
```

---

## ⚙️ Setup Guide

### 1. Prerequisites
- Node.js 18+ and npm/pnpm
- A free [Groq](https://console.groq.com) account + API key
- (Optional) A free [OpenRouter](https://openrouter.ai) account + API key as backup

### 2. Clone & install
```bash
git clone https://github.com/<your-username>/schedgen.git
cd schedgen
npm install
```

### 3. Install core dependencies
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
npm install groq-sdk date-fns
npm install -D tailwindcss postcss autoprefixer
```

### 4. Environment variables
Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here   # optional fallback
```

### 5. Set up the CopilotKit runtime (`app/api/copilotkit/route.ts`)
This route receives chat messages from the frontend and forwards them to Groq using an OpenAI-compatible client, with your registered actions available as tools.

### 6. Define the scheduling action (`actions/createMeeting.ts`)
Use `useCopilotAction` to declare:
- `name`: `createMeeting`
- `parameters`: title, date, time, attendees, notes
- `render`: a live-updating `<MeetingCard />` component as the model fills in args
- `handler`: where you run your deterministic `date-fns` conflict-checking logic

### 7. Wrap your app in the CopilotKit provider
In `app/layout.tsx`, wrap children with `<CopilotKit runtimeUrl="/api/copilotkit">`.

### 8. Run it
```bash
npm run dev
```
Visit `http://localhost:3000` and try: *"Set up a call with the design team tomorrow at 10am."*

---

## 🗺️ Roadmap

- [ ] Basic `createMeeting` action + generative meeting card
- [ ] Conflict detection (warn if overlapping with existing schedule)
- [ ] Edit-in-place on the generated card before confirming
- [ ] Multi-step scheduling (e.g. "reschedule" or "cancel" actions)
- [ ] Optional calendar export (.ics file generation)
- [ ] Swap-able LLM provider (Groq ⇄ OpenRouter) via env config

---

## 📄 License

MIT — feel free to fork and build on this.

---

## 🙋 Author

**Earl Jan Do** (Erzan)
Built as a personal project exploring Generative UI patterns with free-tier LLM infrastructure.