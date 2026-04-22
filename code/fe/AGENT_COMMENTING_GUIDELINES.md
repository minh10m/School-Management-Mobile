# AI Agent Code Commenting Guidelines

This document provides instructions and best practices for the AI agent when adding comments to the codebase. All comments must be written in **English**.

## 1. General Principles

- **Clarity over Conciseness**: Explain complex logic clearly. If a piece of code is non-obvious, explain the intent behind it.
- **Explain the "Why"**: Don't just restate what the code does (e.g., `i++ // increment i`). Explain _why_ the code is doing it (e.g., `// Move to the next index in the buffer`).
- **Professional Tone**: Maintain a neutral, professional, and helpful tone.
- **Language**: Use standard American English.

## 2. Documentation Standards

### 2.1. Functions and Methods (TSDoc/JSDoc)

Use standard TSDoc/JSDoc blocks for all exported functions, methods, and components.

```typescript
/**
 * Fetches the list of assignments for the current student.
 *
 * @param params - Optional filters like ClassYearId.
 * @returns A promise resolving to an array of assignment items.
 * @throws {ApiError} If the network request fails or authentication is invalid.
 */
export const getMyAssignments = async (
  params?: GetAssignmentsParams,
): Promise<StudentAssignmentResponse[]> => {
  // ...
};
```

### 2.2. Interfaces and Types

Document fields in interfaces to clarify their source or format.

```typescript
export interface StudentAssignmentResponse {
  assignmentId: string;
  /** ISO 8601 datetime string representing the deadline */
  finishTime: string;
  /**
   * The submission status:
   * - "Submitted": Already turned in
   * - "Graded": Graded by teacher
   * - null: Not yet submitted
   */
  status: string | null;
}
```

## 3. Inline Comments

- **Logic Blocks**: Group related lines and add a comment at the top explaining the purpose of the block.
- **Edge Cases**: Explicitly comment on how edge cases (nulls, empty arrays, etc.) are handled.
- **TODOs**: Use `// TODO:` for pending improvements or known issues. Include a brief explanation of what needs to be done.

```typescript
// Check if the assignment has already passed the deadline
const isExpired = new Date() > new Date(assignment.finishTime);

if (isExpired && !assignment.status) {
  // Handle the case where the student missed the deadline entirely
  return renderMissedStatus();
}
```

## 4. Component Layout (React/React Native)

When documenting components, use section separators to make the code easier to navigate.

```typescript
// ─── Lifecycle & Data Fetching ──────────────────────────────────────────────

useEffect(() => {
  fetchData();
}, [fetchData]);

// ─── Render Helpers ─────────────────────────────────────────────────────────

const renderHeader = () => (
  // ...
);
```

## 5. Agent Annotations (Optional)

If specifically requested to mark agent contributions, use a consistent tag:
`// [AGENT] This logic was refactored to support paginated API responses.`

---

_Note: Always verify that comments do not become stale after code changes._
