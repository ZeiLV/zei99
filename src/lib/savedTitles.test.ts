import { describe, expect, it } from "vitest";
import { readSavedTitles, savedTitlesKey, toggleSavedTitle } from "./savedTitles";

describe("device saved titles", () => {
  it("adds and removes the exact selected title without duplicates", () => {
    expect(toggleSavedTitle(["anime-a"], "anime-b")).toEqual(["anime-a", "anime-b"]);
    expect(toggleSavedTitle(["anime-a", "anime-b"], "anime-a")).toEqual(["anime-b"]);
  });
  it("isolates different accounts", () => {
    expect(savedTitlesKey("user-a")).not.toBe(savedTitlesKey("user-b"));
  });
  it("recovers malformed data and ignores invalid entries", () => {
    expect(readSavedTitles("broken")).toEqual([]);
    expect(readSavedTitles('["a",null,2,"a","b"]')).toEqual(["a", "b"]);
  });
});