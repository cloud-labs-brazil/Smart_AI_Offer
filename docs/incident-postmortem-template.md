# Incident Postmortem

## Document Control
- Incident ID: `INC-YYYYMMDD-###`
- Title: `<short incident title>`
- Status: `Draft | In Review | Approved | Closed`
- Severity: `SEV-1 | SEV-2 | SEV-3 | SEV-4`
- Date/Time Opened (UTC): `<YYYY-MM-DD HH:MM>`
- Date/Time Resolved (UTC): `<YYYY-MM-DD HH:MM>`
- Duration: `<hh:mm>`
- Incident Commander: `<name>`
- Report Author: `<name>`
- Reviewers: `<name>, <name>`
- Approval Date (UTC): `<YYYY-MM-DD>`

---

## 1. Executive Summary
Provide a concise non-technical and technical summary of:
- What happened
- Who/what was impacted
- Current status
- Primary root cause
- Key remediation completed

**Summary:**  
`<2-6 paragraphs>`

---

## 2. Timeline (UTC)
List key events in chronological order.

| Time (UTC) | Event | Owner | Evidence/Link |
|---|---|---|---|
| `<YYYY-MM-DD HH:MM>` | `<detection / escalation / mitigation step>` | `<name/team>` | `<ticket/log/dashboard link>` |
| `<YYYY-MM-DD HH:MM>` | `<...>` | `<...>` | `<...>` |

---

## 3. Impact Assessment
Describe the business and technical impact.

### 3.1 Service Impact
- Affected services/components: `<api/db/web/jobs/etc>`
- Availability impact: `<outage/degradation/intermittent>`
- Error rate/latency impact: `<metrics>`
- Data impact: `<none | delayed | loss | corruption>`

### 3.2 Business Impact
- Users affected: `<count/segment>`
- Regions/tenants affected: `<scope>`
- SLA/SLO breach: `<yes/no + details>`
- Financial/operational impact: `<estimate>`
- Compliance/security implications: `<if any>`

---

## 4. Detection
Explain how the incident was identified.

### 4.1 Detection Method
- Source: `<monitoring alert | user report | support ticket | manual>`
- First signal timestamp (UTC): `<YYYY-MM-DD HH:MM>`
- Detection gap (if any): `<time from first failure to detection>`

### 4.2 Alert Effectiveness
- Alert that fired: `<name/id>`
- Did it route correctly? `<yes/no>`
- False positive/negative details: `<if any>`
- Required monitoring improvements: `<summary>`

---

## 5. Root Cause Analysis (RCA)
Use evidence-backed analysis; avoid speculation.

### 5.1 Problem Statement
`<single precise statement of failure mode>`

### 5.2 5 Whys (or equivalent)
1. Why did the incident occur? `<answer>`
2. Why did that condition exist? `<answer>`
3. Why was it not prevented? `<answer>`
4. Why was it not detected earlier? `<answer>`
5. Why did safeguards fail? `<answer>`

### 5.3 Contributing Factors
- `<technical debt>`
- `<process/control gap>`
- `<dependency/infrastructure issue>`
- `<change management gap>`

### 5.4 What Worked / What Failed
- Worked: `<mitigations that helped>`
- Failed: `<controls that did not work>`

### 5.5 Evidence
- Logs: `<link>`
- Metrics/Dashboards: `<link>`
- Traces: `<link>`
- PR/Commit/Change Ticket: `<link>`
- Incident channel/ticket: `<link>`

---

## 6. Corrective and Preventive Actions (CAPA)
Track actions to closure with clear ownership.

| ID | Action Type | Description | Owner | Priority | Due Date (UTC) | Status | Validation Method |
|---|---|---|---|---|---|---|---|
| `A-001` | `Corrective` | `<immediate fix>` | `<name/team>` | `P0/P1/P2` | `<YYYY-MM-DD>` | `Open/In Progress/Done` | `<test/monitoring/audit>` |
| `A-002` | `Preventive` | `<long-term control>` | `<name/team>` | `P0/P1/P2` | `<YYYY-MM-DD>` | `Open/In Progress/Done` | `<test/monitoring/audit>` |

### 6.1 Immediate Remediation Completed
- `<item>`
- `<item>`

### 6.2 Follow-Up Controls
- `<runbook update>`
- `<alerting enhancement>`
- `<test automation>`
- `<capacity / resiliency improvement>`

---

## 7. Owners and Accountability
Define responsible roles and approval chain.

| Role | Name | Responsibility |
|---|---|---|
| Incident Commander | `<name>` | `<coordination and decision-making>` |
| Technical Lead | `<name>` | `<technical RCA and remediation>` |
| Service Owner | `<name>` | `<service reliability and CAPA delivery>` |
| QA/Validation Owner | `<name>` | `<validation of corrective actions>` |
| Program Governance Owner | `<name>` | `<approval and closure>` |

---

## 8. ETA and Milestones
Capture delivery plan for remaining actions.

| Milestone | Description | Owner | ETA (UTC) | Success Criteria |
|---|---|---|---|---|
| `M1` | `<short-term fix completion>` | `<name/team>` | `<YYYY-MM-DD>` | `<objective evidence>` |
| `M2` | `<preventive control deployed>` | `<name/team>` | `<YYYY-MM-DD>` | `<objective evidence>` |
| `M3` | `<governance closure>` | `<name/team>` | `<YYYY-MM-DD>` | `<sign-off complete>` |

---

## 9. Communication Record
- Internal incident channel: `<link>`
- Stakeholder updates sent at: `<timestamps>`
- Customer/public communication required: `<yes/no>`
- Final closure announcement date (UTC): `<YYYY-MM-DD HH:MM>`

---

## 10. Governance Sign-Off
- Technical Sign-Off: `<name/date>`
- Security/Compliance Sign-Off: `<name/date>`
- Program Governance Sign-Off: `<name/date>`
- Closure Decision: `Approved | Rejected | Needs Follow-up`

---

## Appendix A: Metrics Snapshot
- Peak error rate: `<value>`
- Max latency: `<value>`
- MTTA: `<value>`
- MTTR: `<value>`
- Total incident duration: `<value>`

## Appendix B: Change Log
| Version | Date (UTC) | Author | Changes |
|---|---|---|---|
| `v0.1` | `<YYYY-MM-DD>` | `<name>` | `<initial draft>` |
| `v1.0` | `<YYYY-MM-DD>` | `<name>` | `<approved final>` |

