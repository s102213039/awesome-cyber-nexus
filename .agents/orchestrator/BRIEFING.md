# BRIEFING — 2026-07-10T19:41:40+08:00

## Mission
Orchestrate the implementation of the WebGL/Canvas visual effects gallery and interactive concept portfolio.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/orchestrator
- Original parent: parent
- Original parent conversation ID: 8096221d-8d68-4e68-a927-98ef36b7d29f

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /Users/yanli/AndroidStudioProjects/awesomeWeb/PROJECT.md
1. **Decompose**: Decompose the project into milestones (implementation track and E2E testing track), define interface contracts, and track progress.
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones and E2E testing track.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns. Write handoff.md, spawn successor, and exit.
- **Work items**:
  1. Decompose & Plan [in-progress]
  2. Implement E2E Testing Track [pending]
  3. Implement Milestones [pending]
  4. Pass E2E Tests & Harden [pending]
- **Current phase**: 1
- **Current focus**: Decompose & Plan

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Always prefix shell commands with `rtk` when running commands (or instructing workers).
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 8096221d-8d68-4e68-a927-98ef36b7d29f
- Updated: 2026-07-10T14:58:10+08:00

## Key Decisions Made
- Use Project Pattern to run parallel E2E Testing Track and Implementation Track.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_init | teamwork_preview_explorer | Codebase Exploration | completed | e4d2f843-6ecf-4424-8f1d-d6f21f0439d0 |
| e2e_testing_orch | self | E2E Testing Track | failed | ba53ef70-452c-4fc0-b820-eadda731fb1d |
| sub_orch_m1 | self | Milestone 1 (WebGL Setup) | completed | f7371d60-2cca-427b-9e02-1d5ea21ed6d8 |
| sub_orch_m2 | self | Milestone 2 (Particle Space) | failed | 70ce7eb4-4d85-44c4-ad10-dc79cc9e11d8 |
| e2e_testing_orch_rep | self | E2E Testing Track (Rep) | completed | 0249c884-44c2-432a-b10c-6bfba136f878 |
| sub_orch_m2_rep | self | Milestone 2 (Particle Space, Rep) | failed | e8ee8aea-dc85-4f6a-b940-9f5edbb1b0e3 |
| worker_check_tests | teamwork_preview_worker | Run initial E2E tests check | completed | 16caeb00-f38d-4f08-9107-b68c67fa82fc |
| worker_git_check | teamwork_preview_worker | Run git status and diff | completed | f7681766-0057-4880-8420-741f921990aa |
| auditor_final | teamwork_preview_auditor | Forensic Integrity Audit | in-progress | 8d2b097d-fc1e-4888-815d-9bf420a508ec |

## Succession Status
- Succession required: no
- Spawn count: 10 / 16
- Pending subagents: 8d2b097d-fc1e-4888-815d-9bf420a508ec
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: ab007363-361a-46c1-9934-29a448018e95/task-61
- Safety timer: none

## Artifact Index
- /Users/yanli/AndroidStudioProjects/awesomeWeb/PROJECT.md — Global index for architecture, milestones, interfaces, code layout.
- /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/orchestrator/progress.md — Internal heartbeat and checklist.
- /Users/yanli/AndroidStudioProjects/awesomeWeb/.agents/orchestrator/context.md — Context tracking.
