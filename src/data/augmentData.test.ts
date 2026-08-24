import { describe, expect, it } from "vitest";
import augments from "./set-17/augments.json";

describe("Set 17 augment data", () => {
  it("contains the complete imported augment pool with unique IDs", () => {
    expect(augments.length).toBeGreaterThanOrEqual(250);
    expect(new Set(augments.map((augment) => augment.id)).size).toBe(augments.length);
    expect(augments.every((augment) => augment.apiName && augment.name)).toBe(true);
  });
});
