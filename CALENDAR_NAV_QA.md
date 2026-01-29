# QA Checklist: Calendar Navigation (Swipe)

## Objective
Verify that the horizontal swipe navigation in the Calendar screen works smoothly across ranges and maintains data integrity.

## Test Cases

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| NAV-01 | **Week Swipe (Left)** | Calendar advances to next week. Month title updates. | [ ] |
| NAV-02 | **Week Swipe (Right)** | Calendar goes back to previous week. | [ ] |
| NAV-03 | **Month Swipe (Left)** | Calendar advances to next month. Grid updates correctly. | [ ] |
| NAV-04 | **Data Persistence** | Navigating away and back to a week with events shows markers. | [ ] |
| NAV-05 | **Day Selection** | Selecting a day in "Next Week" correctly filters daily events. | [ ] |
| NAV-06 | **Add Event Sync** | Adding an event in a future week via modal works and appears. | [ ] |

## Reproducible Steps
1. Open Calendar Screen.
2. Ensure "Semana" view is active.
3. Swipe left on the week strip.
4. Verify month title and dates change.
5. Tap a day.
6. Verify "Eventos del día" list appears for that day.
7. Switch to "Mes" view.
8. Swipe left on the grid.
9. Verify month changes.

## Evidence Required
- Video recording of swipe interaction.
- Screenshot of a future month with a test event.
