# Ingestion Strategy v2.0

## Mode A: Manual CSV Upload
- **Trigger**: User-initiated.
- **Validation**: Strict schema check.
- **Priority**: High (can override API data).

## Mode B: Jira API Sync
- **Trigger**: Scheduled or Manual.
- **Auth**: API Token + Site URL.
- **Query**: Custom JQL.

## Discrepancy Validation Rules
Compare CSV vs API datasets on:
1. **Record Count**: Threshold ±1%
2. **Total Allocation**: Threshold ±0.5%
3. **Total Revenue**: Threshold ±0.5%

If thresholds exceeded:
- Status: `UNVERIFIED`
- Action: Block baseline replacement, alert Admin.
