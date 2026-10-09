import { describe, expect, it } from "vitest";
import { dataDirector } from "../core/DataDirector";
import {
  createAnalysisTexture,
  createExpectationTexture,
  encodeSigned,
  encodeUnit,
  ANALYSIS_RANGES,
} from "./SurfaceTextures";
import { describeAssociation } from "../intelligence/AssociationModel";

describe("derived GPU channels", () => {
  it("encodes signed quantities with a stable neutral midpoint and explicit ranges", () => {
    expect(encodeSigned(0, 0.6)).toBe(128);
    expect(encodeSigned(-0.6, 0.6)).toBe(0);
    expect(encodeSigned(0.6, 0.6)).toBe(255);
    expect(encodeUnit(2)).toBe(255);
  });
  it("packs normal and process data from exact CPU samples and neutralizes invalid pixels", () => {
    const field = dataDirector.hero.surface,
      texture = createAnalysisTexture(field),
      bytes = texture.image.data as Uint8Array;
    const i = field.validity.findIndex((value) => value === 1),
      invalid = field.validity.findIndex((value) => value === 0);
    expect(bytes[i * 4]).toBe(encodeUnit(field.normalMean![i]));
    expect(bytes[i * 4 + 1]).toBe(
      encodeUnit(field.normalVariation![i] / ANALYSIS_RANGES.variation),
    );
    expect(bytes[i * 4 + 2]).toBe(
      encodeSigned(field.normalDeviation![i], ANALYSIS_RANGES.normalDeviation),
    );
    expect(bytes[i * 4 + 3]).toBe(
      encodeSigned(field.residual![i], ANALYSIS_RANGES.residual),
    );
    expect([...bytes.slice(invalid * 4, invalid * 4 + 4)]).toEqual([
      0, 0, 128, 128,
    ]);
    texture.dispose();
  });
  it("packs baseline and what-if expectation independently while validity masks support", () => {
    const field = dataDirector.hero.surface,
      whatIf = dataDirector.whatIf({ nozzlePosition: 0.9 });
    const texture = createExpectationTexture(
        field,
        dataDirector.processPrediction,
        whatIf,
      ),
      bytes = texture.image.data as Uint8Array;
    const i = 200,
      invalid = field.validity.findIndex((value) => value === 0);
    expect(bytes[i * 4]).toBe(
      encodeUnit(dataDirector.processPrediction.expected[i]),
    );
    expect(bytes[i * 4 + 1]).toBe(
      encodeUnit(dataDirector.processPrediction.support[i]),
    );
    expect(bytes[i * 4 + 2]).toBe(encodeUnit(whatIf.prediction.expected[i]));
    expect(bytes[i * 4 + 3]).toBe(
      encodeSigned(whatIf.residual[i], ANALYSIS_RANGES.residual),
    );
    expect([...bytes.slice(invalid * 4, invalid * 4 + 4)]).toEqual([
      0, 0, 0, 128,
    ]);
    texture.dispose();
  });
  it("describes only supported associations and never calls correlation a cause", () => {
    expect(
      describeAssociation({
        factor: "flowRate",
        correlation: 0,
        samples: 1,
        illustrative: true,
        causalClaim: false,
      }).strength,
    ).toBe("insufficient evidence");
    expect(
      describeAssociation({
        factor: "nozzlePosition",
        correlation: 0.9,
        samples: 13,
        illustrative: true,
        causalClaim: false,
      }).strength,
    ).toBe("strong association");
  });
});
