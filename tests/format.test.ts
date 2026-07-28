import { describe, it, expect } from "bun:test"
import { estimateTokens, formatTokenCount } from "../src/format"

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0)
  })

  it("returns 1 for 4 characters", () => {
    expect(estimateTokens("abcd")).toBe(1)
  })

  it("rounds up", () => {
    expect(estimateTokens("abcde")).toBe(2)
  })
})

describe("formatTokenCount", () => {
  it("returns raw number for < 1000", () => {
    expect(formatTokenCount(999)).toBe("999")
  })

  it("formats 1000 as 1K", () => {
    expect(formatTokenCount(1000)).toBe("1K")
  })

  it("formats 1500 as 1.5K", () => {
    expect(formatTokenCount(1500)).toBe("1.5K")
  })

  it("formats 10000 as 10K", () => {
    expect(formatTokenCount(10000)).toBe("10K")
  })
})
