import { describe, expect, it } from "vitest";
import type { Quest } from "../quests/types";
import { achievementState, attachableAchievementIds } from "./availability";
import { ACHIEVEMENTS } from "./definitions";

const q = (achievementId: string, status: Quest["status"]): Quest => ({
  id: `q-${achievementId}-${status}`, title: "t", description: "", category: "family", questType: "project",
  assignedTo: ["a"], currentValue: 0, startDate: "", status, createdBy: "p", achievementId,
});
const def = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;

describe("achievement availability", () => {
  it("starter is never attachable", () => {
    expect(attachableAchievementIds([], new Set()).has("first_step")).toBe(false);
    expect(achievementState(def("first_step"), [], new Set()).kind).toBe("starter");
  });
  it("an open quest reserves the achievement; cancelled/approved quests release or consume it", () => {
    expect(achievementState(def("water_keeper"), [q("water_keeper", "submitted")], new Set()).kind).toBe("linked");
    expect(achievementState(def("water_keeper"), [q("water_keeper", "cancelled")], new Set()).kind).toBe("available");
    expect(achievementState(def("water_keeper"), [q("water_keeper", "approved")], new Set(["water_keeper"])).kind).toBe("claimed");
  });
  it("lists only unclaimed, unreserved, non-starter achievements", () => {
    const ids = attachableAchievementIds([q("family_garden", "in_progress")], new Set(["water_keeper"]));
    expect([...ids].sort()).toEqual(["gathering_place", "organized_home"]);
  });
});
