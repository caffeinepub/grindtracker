# GrindTracker

## Current State
Fully built frontend with 6 pages (Landing, Dashboard, Tasks, Focus, Leaderboard, Insights). All data is hardcoded mock data from `mockData.ts`. There is no authentication, no real user accounts, and no data persistence. The backend is an empty actor.

## Requested Changes (Diff)

### Add
- Internet Identity login via the `authorization` component
- A dedicated Login/Auth page shown when user is not authenticated
- Backend storage for per-user profile: username, XP, level, streak, tasks, focus sessions
- Backend API: `getProfile`, `createProfile`, `updateProfile`, `getTasks`, `addTask`, `updateTask`, `deleteTask`, `getFocusSessions`, `addFocusSession`, `getLeaderboard`
- On first login, auto-create a fresh personalized profile (no demo data)
- Data syncs across devices via the backend (tied to Internet Identity principal)

### Modify
- App.tsx: Wrap with `InternetIdentityProvider`, guard all app pages behind auth, show login page if not logged in
- LandingPage: Replace "Start Grinding" with a login/signup CTA that triggers Internet Identity
- Dashboard, Tasks, Focus, Leaderboard, Insights: Load real data from backend instead of mockData
- Navigation: Show logged-in user's name/avatar + logout button
- After login, if no profile exists → create one and route to dashboard with empty (fresh) state

### Remove
- Hardcoded mock user ("Alex Chen") from all pages
- Example/demo tasks, focus sessions from initial view after login

## Implementation Plan
1. Select `authorization` component
2. Generate Motoko backend with user profile storage, tasks, focus sessions, leaderboard
3. Update frontend:
   - Wrap app with InternetIdentityProvider
   - Add auth guard: unauthenticated → show landing/login, authenticated → show app
   - Login button on landing page triggers II login
   - After login: call `getProfile`, if none exists call `createProfile` with a fresh empty profile
   - Wire Dashboard, Tasks, Focus pages to real backend data
   - Leaderboard pulls from backend's global list
   - Navigation shows real user info + logout
