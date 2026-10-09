import { describe, expect, it } from "vitest";
import { DataDirector } from "./DataDirector";
import { PrototypeDataProvider } from "../../data/providers/PrototypeDataProvider";
import type { ExperienceDataProvider } from "../../data/providers/ExperienceDataProvider";

function providerWithUnsupportedHero(): ExperienceDataProvider {
  const source = new PrototypeDataProvider();
  const hero = source.getHeroTyre();
  hero.variantId = "unsupported-variant";
  hero.surface.metadata.variantId = hero.variantId;
  return {
    getHeroTyre: () => hero,
    getNormalPopulation: () => source.getNormalPopulation(),
    getProcessHistory: () => ({
      ...source.getProcessHistory(),
      records: source.getProcessHistory().records.filter(record => record.id === hero.id),
    }),
  };
}

describe("provider integration", () => {
  it("routes unsupported variants to review instead of crashing before policy", () => {
    const director = new DataDirector(providerWithUnsupportedHero());
    expect(director.heroDecision.disposition).toBe("REVIEW");
    expect(director.heroDecision.productIndicators).toBeNull();
    expect(director.characterizeSignature().supported).toBe(false);
    expect(director.explanation()).toBeNull();
    expect(director.hero.surface.normalMean).toBeUndefined();
  });

  it("does not interpret a nominal reference as an explanation without telemetry", () => {
    const source = new PrototypeDataProvider();
    source.getHeroTyre().processState = { timestamp: 0, values: {} };
    const director = new DataDirector(source);
    expect(director.processPrediction.status).toBe("unavailable");
    expect(director.explanation()).toBeNull();
    expect(director.processHealth.every(result => Number.isFinite(result.index))).toBe(true);
  });
});
