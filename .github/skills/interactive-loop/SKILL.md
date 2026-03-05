---
name: interactive-loop
description: "Continue chat with MCQ prompts after every task. Use when: user wants next-step options, interactive workflow, continuous guidance, follow-up questions, keep chat going, ask what to do next."
argument-hint: "Describe the task area (e.g., setup, debugging, feature work)"
---

# Interactive Loop — Terminal-Based Infinite Conversation

## Purpose

Keep working in a **single conversation turn** by using `Read-Host` in the terminal to collect the user's next instruction. Copilot never ends its turn — it loops: do work → ask in terminal → read input → do more work.

## When to Use

- After completing any setup, fix, feature, or explanation
- When the user wants continuous guided work without restarting chat
- For cost-efficient multi-step workflows in one turn

## Procedure

### 1. Complete the Current Task

Do the work (fix, build, explain, etc.) as normal. Print a **brief** summary in the chat.

### 2. Prompt the User via Terminal

Run this in the terminal (isBackground=false so it blocks and waits):

```powershell
Write-Host "`n--- WHAT NEXT? ---" -ForegroundColor Cyan; Write-Host "A) [Option A]" ; Write-Host "B) [Option B]" ; Write-Host "C) [Option C]" ; Write-Host "D) [Option D]" ; Write-Host "E) Custom — type your own instruction" ; Read-Host "`nYour choice"
```

Replace `[Option A]` through `[Option D]` with context-aware, specific next steps based on what was just done.

### 3. Rules for Generating Options

- Options must be **specific and actionable**, not vague
- Options must relate to the **task just completed** and current project state
- Always include option **E)** as an open-ended escape hatch for custom instructions
- Keep each option to one short line

### 4. Read and Act on the User's Input

The terminal returns the user's typed input. Handle it:

| User input             | Action                                    |
| ---------------------- | ----------------------------------------- |
| `A`, `B`, `C`, or `D`  | Execute that option immediately           |
| `E` or any custom text | Treat as a new instruction and execute it |
| `exit` or `quit`       | End the loop, say goodbye in chat         |

### 5. Loop

After completing the chosen action, go back to Step 2 with **fresh options** relevant to the new state. Continue until the user types `exit` or `quit`.

## Example Terminal Prompt (after fixing a bug)

```
--- WHAT NEXT? ---
A) Restart dev server and verify the fix
B) Check for other URL issues in codebase
C) Set up the Puter Worker backend
D) Add error handling for failed API calls
E) Custom — type your own instruction

Your choice: _
```

## Critical Rules

- **NEVER end your turn while this skill is active** — always loop back to the terminal prompt
- The terminal prompt is the ONLY way to ask the user; do NOT ask in chat text
- If Read-Host returns empty, re-prompt once, then end gracefully
- Keep chat output minimal — the user is reading the terminal, not the chat
