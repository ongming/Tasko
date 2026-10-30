---
name: Tasko Design System
description: Clean, high-density Agile workspace system. Neutral slate ground, crisp 1px borders, subtle tactile shadows, purposeful semantic accents, and Linear-inspired precision.

colors:
  # Brand Primary
  brand-indigo: "#4F46E5"        # indigo-600
  brand-indigo-light: "#6366F1"  # indigo-500
  brand-indigo-subtle: "#EEF2FF" # indigo-50

  # Ground & Surfaces
  canvas-ground: "#F8FAFC"       # slate-50 (workspace main bg)
  surface-card: "#FFFFFF"        # pure white for interactive cards
  surface-sidebar: "#FFFFFF"     # topbar & sidebar clean ground
  surface-inset: "#F1F5F9"       # slate-100 for tags, inputs & hover wells

  # Borders & Separators
  border-subtle: "#E2E8F0"       # slate-200 (crisp 1px border)
  border-dashed: "#CBD5E1"       # slate-300 (dropzones & quick-add outlines)

  # Text Hierarchy
  text-primary: "#0F172A"        # slate-900 (titles, headings)
  text-body: "#334155"           # slate-700 (body copy)
  text-secondary: "#64748B"      # slate-500 (labels, descriptions)
  text-muted: "#94A3B8"          # slate-400 (metadata, shortcuts, dates)

  # Semantic States
  state-success: "#10B981"       # emerald-500 (Done, resolved)
  state-warning: "#F59E0B"       # amber-500 (In progress, starred)
  state-danger: "#EF4444"        # rose-500 (Blocked, high priority)
  state-info: "#3B82F6"          # blue-500 (Review, backlog)
---

# Tasko Design Guidelines

## 1. Anti-AI Slop Mandates
- **Zero pointless gradients**: Never slap random linear gradients across background panels or card headers. Gradients are only acceptable for the brand logo mark itself.
- **No container inception**: Avoid wrapping content in cards that are inside cards that are inside cards. Flatten the hierarchy. Use whitespace and typography rather than endless borders to separate items.
- **Hug content (`h-fit self-start`)**: Columns and wrappers must hug their real content tightly rather than stretching out with massive dead empty zones.
- **Micro-interactions**: Hover effects must be tight and purposeful (`hover:border-indigo-300 hover:shadow-sm duration-150`), never floaty or cartoonish.

## 2. Typography & Hierarchy
- **Font Stack:** Charlie Sans / Inter, system sans-serif fallback.
- **Sizes & Weights:**
  - Page Titles: `text-2xl` or `text-3xl`, `font-bold`, `tracking-tight`, `text-slate-900`
  - Section Headings: `text-sm font-bold text-slate-800` or `text-base font-semibold`
  - Body Text: `text-xs` to `text-sm`, `text-slate-700`
  - Metadata / Badges / Labels: `text-[11px]` or `text-xs`, `font-semibold` or `font-mono` for IDs (e.g. `WR-101`)

## 3. Cards & Surfaces
- Background: pure white `bg-white` on `bg-slate-50` page canvas.
- Corners: `rounded-xl` for cards, `rounded-2xl` for large section wrappers, `rounded-lg` for buttons and inputs.
- Elevation: `shadow-2xs` (subtle resting state), `shadow-md` on hover for interactive task cards.
- Borders: `border border-slate-200/80` (hairline crisp 1px).

## 4. Workspaces & Jira/Linear Standards
- **Global vs Project-level:**
  - Workspace navigation (Sidebar) holds global items: *Tổng quan* (Overview), *Đã đánh dấu sao* (Starred Popover), and *Dự án của tôi* (Workspace Project Selector).
  - Project-level views belong inside the project canvas: *Control Board*, *Bảng Kanban*, *Backlog*, *Timeline*, *Calendar*, *Gantt*.
- **Quick Actions:**
  - Plus `+` buttons for quick creation must be compact, dashed, and placed directly below tasks or inside empty slots.
