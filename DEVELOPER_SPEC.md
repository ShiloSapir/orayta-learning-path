# Orayta Developer Specification

Orayta is a bilingual Torah learning application that recommends personalized sources from the Sefaria API. The project uses React and TypeScript on the frontend with Tailwind for styling, Supabase for backend data and authentication, Make (Integromat) for automations, and Google Calendar integration.

## Project Goals
- Provide spiritual, bite-sized Torah learning adjusted to a user's available time and chosen topic.
- Support Hebrew and English interfaces with RTL layout switching and dark mode.
- Enable journaling, reflection prompts, and learning streak tracking.
- Allow scheduling learning sessions in Google Calendar with automated reminders.

## Core Features
1. **Welcome & Onboarding**
   - Start Learning button, language toggle, and a dark mode toggle implemented with a Switch component.
2. **Time & Topic Selection**
   - Users pick a learning duration (5–60 minutes) and topic such as Halacha, Rambam, Parasha, Mishnah/Talmud, or others.
3. **Source Recommendation**
   - Returns title, reference range, summary, suggested commentaries, Sefaria link, and reflection prompt.
   - Avoids repeating recent sources and allows skipping.
4. **Reflection & Journal**
   - Text area with optional tags. Journal page shows saved sessions with streak tracking.
5. **Calendar Integration**
   - Add a session to Google Calendar through Make automation. Daily reminder emails are sent based on user preference.
6. **Profile Settings**
   - Manage language, dark mode, reminder time, and Google Calendar sync.
   - Accessible from the welcome screen via a Profile button.
7. **Guest Access**
   - View a limited number of sources without saving or calendar features.
8. **Admin Dashboard**
   - Approve and edit sources, moderate reflections, and view analytics.

## Supabase Schema Overview
```
users(id, name, email, role, preferred_language, dark_mode, calendar_synced, reminder_time, created_at)
learning_sessions(id, user_id, time_selected, topic_selected, source_id, status, created_at)
sources(id, title, category, estimated_time, start_ref, end_ref, commentaries[], sefaria_link, text_excerpt, reflection_prompt, published, subcategory)
reflections(id, user_id, session_id, note, tags[], created_at)
```

## Automations via Make
- Retrieve sources from Sefaria based on time/topic.
- Update session status when marked learned.
- Store reflections and add calendar events.
- Send daily reminder emails.
- Handle account deletion and admin publishing workflow.

## Technology Stack
- **Frontend:** React, TypeScript, Tailwind, shadcn-ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **APIs & Automation:** Sefaria API, Make (Integromat), Google Calendar/Gmail

This file summarizes the functional and technical requirements for the MVP of the Orayta app.

## UI Design Notes
- Pages use warm gradient backgrounds with frosted glass cards for a spiritual feel.
- Primary buttons include a subtle glow animation to draw attention.
- The mobile bottom navigation bar has a blurred backdrop for a modern aesthetic.
