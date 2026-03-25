# GrindTracker

## Current State
- Full-stack productivity app with Tasks, Dashboard, Focus, Leaderboard, Insights pages
- Tasks stored in backend Map<Nat, Task> with incrementing IDs
- Frontend uses array index as task ID (bug: ID mismatch causes update/delete to fail)
- Leaderboard shows all users globally
- Profile has username but no UI to change it after account creation
- No friends system

## Requested Changes (Diff)

### Add
- Friends system: send friend request by Principal ID, accept/reject incoming requests, remove friends
- Friends-only leaderboard tab on the Leaderboard page
- "Rename Account" button accessible from Dashboard/Navigation so user can update username at any time
- Backend: `getTasks` returns tasks with IDs as tuples `[(Nat, Task)]`
- Backend: `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`, `getFriends`, `getFriendRequests`, `getFriendsLeaderboard`, `removeFriend`
- Backend: allow getting any user's profile for leaderboard/friend context

### Modify
- Fix task toggle and delete: use actual backend task ID (from tuple) instead of array index
- Leaderboard page: add "Friends" tab alongside "Global" tab with friend-only rankings
- Leaderboard page: add "Add Friend" button/flow so users can add friends by Principal ID
- AppContext: update Task type to include `id: bigint` from backend tuples

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: change `getTasks` to return `[(Nat, Task)]`, add full friends system
2. Update `backend.d.ts` to reflect new API
3. Update `AppContext` to handle `[bigint, Task]` tuples, expose `id` on tasks
4. Fix `TasksPage` and `DashboardPage` to use `task.id` for updateTask/deleteTask
5. Update `LeaderboardPage`: add Global/Friends tabs, add friend, friend requests UI
6. Add rename account modal accessible from Navigation or Dashboard
