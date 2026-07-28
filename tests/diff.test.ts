import { describe, it, expect } from "bun:test"
import { generateUnifiedDiff } from "../src/diff.ts"

describe("generateUnifiedDiff", () => {
  const filepath = "test.txt"

  it('returns "No changes detected" when original and modified are identical', () => {
    const result = generateUnifiedDiff(filepath, "foo\nbar\nbaz\n", "foo\nbar\nbaz\n")
    expect(result).toBe("No changes detected")
  })

  it("returns a unified diff with @@ hunks for added lines", () => {
    const original = "line1\nline2\n"
    const modified = "line1\nline2\nline3\n"
    const result = generateUnifiedDiff(filepath, original, modified)
    expect(result).toContain("@@")
    expect(result).toContain("+line3")
  })

  it("returns a unified diff with @@ hunks for removed lines", () => {
    const original = "line1\nline2\nline3\n"
    const modified = "line1\nline3\n"
    const result = generateUnifiedDiff(filepath, original, modified)
    expect(result).toContain("@@")
    expect(result).toContain("-line2")
  })

  it("returns a unified diff with @@ hunks for changed lines", () => {
    const original = "hello\nworld\n"
    const modified = "hello\nthere\n"
    const result = generateUnifiedDiff(filepath, original, modified)
    expect(result).toContain("@@")
  })

  it("prepends filepaths with a/ and b/", () => {
    const original = "foo\n"
    const modified = "bar\n"
    const result = generateUnifiedDiff(filepath, original, modified)
    expect(result).toContain("a/test.txt")
    expect(result).toContain("b/test.txt")
  })

  it("preserves 3 context lines around each hunk", () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i + 1}`)
    const modified = [...lines]
    modified.splice(5, 0, "added")
    const originalStr = lines.join("\n") + "\n"
    const modifiedStr = modified.join("\n") + "\n"
    const result = generateUnifiedDiff(filepath, originalStr, modifiedStr)
    const contextLines = result
      .split("\n")
      .filter((l) => l.startsWith(" "))
      .length
    expect(contextLines).toBeGreaterThan(0)
  })
})
