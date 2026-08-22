# Agent Rules for Dunstun Portfolio Workspace

This document contains behavioral guidelines and constraints specific to the development of this Portfolio system.

## Template Design Consistency
1. **Primary Template:** The **Obsidian** template is the primary design standard. When designing new features, always implement and test them on Obsidian first.
2. **Data Consistency Across Templates:** Always ensure that all templates (such as Ivory or any new templates created in the future) display the exact same set of data fields as Obsidian. For example, if a model field (like `features`, `price`, or `description` fallback logic) is rendered in Obsidian, it must also be rendered/handled in Ivory and other templates to keep template capabilities functionally aligned.
