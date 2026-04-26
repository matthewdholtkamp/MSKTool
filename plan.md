1. **Add `wrist_follow_up_status` fork**
   - Update `wrist_special_tests` node to point to `wrist_follow_up_status` instead of `wrist_symptoms_persist` when `visitTypeState === '7day'` and the special tests are negative.
   - Create `wrist_follow_up_status` node with a question "Symptoms Persist?" and options "Yes" (points to `wrist_symptoms_persist`) and "Mostly Resolved" (points to `wrist_mostly_resolved`).

2. **Update `wrist_symptoms_persist` endpoint**
   - Change `tools` to `["wristProfiles", "analgesics", "peaceProtocol"]`.
   - Update `plan` to:
     • Profile Moderate x 2-3 weeks
     • Analgesic Meds PRN (see above)
     • PEACE (see above)
     • Referral: OT or Ortho, as indicated, in 7-10 days
   - Keep assessment as "Acute Hand/Wrist Pain, persistent symptoms despite negative exams." and consults as "Occupational Therapy or Orthopedics in 7-10 days".

3. **Add `wrist_mostly_resolved` endpoint**
   - Type: `endpoint`
   - `tools`: `["wristProfiles", "analgesics", "peaceProtocol"]`
   - `assessment`: "Acute Hand/Wrist Pain, mostly resolved."
   - `consults`: "None immediately required"
   - `plan`:
     • Duty Specific Min Profile PRN
     • Analgesic Meds PRN (See above)
     • PEACE (See Above)
     • RTD end of profile anticipated

4. **Pre-commit checks**
   - Run `pre_commit_instructions` tool to verify I have done all reviews and testing correctly.

5. **Submit changes**
   - Commit and submit the branch.
