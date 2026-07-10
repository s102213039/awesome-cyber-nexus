---
name: popup-questions
description: Always use ask_question tool (popup modal) instead of inline text when asking the user questions, including grill-me interviews, clarifications, and design decisions.
---

# Popup Questions Skill

## Rule

When you need to ask the user any question — including but not limited to:
- `/grill-me` interview questions
- Clarification questions
- Design decision questions
- Confirmation prompts
- Any multi-choice or preference questions

**You MUST use the `ask_question` tool** to present the question as an interactive popup modal.

**You MUST NOT** write questions as inline text in your response and expect the user to type an answer.

## Guidelines

- Provide clear, concise options for each question.
- If you have a recommended option, prefix it with `(Recommended)` and list it first.
- Use `is_multi_select: true` when the user can choose multiple options.
- Keep the question title short and descriptive.
- For `/grill-me` sessions, ask questions **one at a time** using separate `ask_question` calls after each response.
