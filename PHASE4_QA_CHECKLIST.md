# QA Checklist: Phase 4 (Wahoo Integration)

## Objective
Verify that the user can connect their Wahoo account (simulated) and sync activities.

## Test Cases

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| WAHOO-01 | **Auth Flow Start** | Clicking "Wahoo" opens browser with OAuth URL. | [ ] |
| WAHOO-02 | **Auth Success** | After redirect (mocked), button changes to Sync icon. | [ ] |
| WAHOO-03 | **Sync Execution** | Clicking Sync icon triggers `syncWorkouts`. | [ ] |
| WAHOO-04 | **DB Storage** | `wahoo_tokens` table contains user tokens. | [ ] |
| WAHOO-05 | **Workouts Import** | `workouts` table receives simulated activities. | [ ] |
| WAHOO-06 | **Deduplication** | Re-syncing does not duplicate existing workouts. | [ ] |

## Reproducible Steps
1. Navigate to Dashboard.
2. Click the white "Wahoo" pill button.
3. Observe browser opening (can close it for mock flow).
4. Wait 3 seconds for simulated success.
5. Verify button changes to a blue circular refresh icon.
6. Click functionality is mocked to log "Syncing".

## Evidence Required
- Screenshot of Dashboard with "Wahoo" button.
- Screenshot of Dashboard "Connected" state (Sync icon).
