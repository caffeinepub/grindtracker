# GrindTracker

## Current State
The Dashboard shows today's tasks only (filtered by today's date range), a quick-add task form, XP progress bar, stat cards, and a radar chart. The backend `addTask` already accepts a `dueDate` (Int timestamp) and `getTasks()` returns all tasks with their due dates. No day-selection UI exists.

## Requested Changes (Diff)

### Add
- **Days Panel** in the Dashboard: a weekly calendar strip showing Mon–Sun of the current week (like the reference screenshot), with each day card displaying the day name, date number, and task completion summary.
- Selected day is highlighted (purple border). Clicking a day card changes the active day and shows that day's tasks below.
- Navigation arrows to go to previous/next weeks so users can view past and future weeks.
- Quick-add task form should add to the currently selected day (not always today).
- "Today" button/indicator to jump back to the current week/day.

### Modify
- `DashboardPage.tsx`: Replace "Today's Tasks" section header with "[Selected Day]'s Tasks". The task filter changes from today-only to the selected day's date range.
- Quick-add task: `dueDate` should be end-of-selected-day, not always today.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `selectedDate` state (Date) to DashboardPage, default today.
2. Add `weekOffset` state (number) to navigate weeks.
3. Compute the Mon–Sun array for the current week offset.
4. Render a scrollable horizontal strip of 7 day cards above the tasks/radar grid.
5. Each day card shows: short day name, date number, task count / completion indicator (color dot like the reference: green for 90%+, yellow, orange, red, grey for no tasks).
6. Add left/right arrows to move weeks. Add a "Today" chip that resets weekOffset to 0 and selectedDate to today.
7. Update task filter to use selectedDate range instead of today.
8. Update quick-add task to use end-of-selectedDate as dueDate.
9. Make the week strip horizontally scrollable on mobile (overflow-x-auto, snap scroll).
