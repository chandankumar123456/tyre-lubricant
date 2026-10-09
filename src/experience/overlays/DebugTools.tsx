import { useEffect, useRef, useState } from "react";
import { dataDirector } from "../core/DataDirector";
import { surfaceIndex } from "../surface/SurfaceField";
import { scenes } from "../core/SceneRegistry";
import { subscribeFrame } from "../core/AnnotationRegistry";
import styles from "./DebugTools.module.css";
const evidence = dataDirector.evidenceLocation;

/** Local development only. DOM telemetry never drives story state. */
export function DebugTools({ jump }: { jump: (index: number) => void }) {
  const telemetry = useRef<HTMLPreElement>(null);
  const [u, setU] = useState(evidence.u),
    [v, setV] = useState(evidence.v);
  const lineage = dataDirector.lineage();
  const field = dataDirector.hero.surface,
    index = surfaceIndex(field, u, v);
  const drift = dataDirector.aggregateHistory("short");
  const channels = {
    Observation: field.observation[index],
    Confidence: field.confidence[index],
    Validity: field.validity[index],
    "Normal mean": field.normalMean?.[index],
    "Normal variation": field.normalVariation?.[index],
    "Normal deviation": field.normalDeviation?.[index],
    "Process expected": field.processExpected?.[index],
    "Process deviation": field.processDeviation?.[index],
    Residual: field.residual?.[index],
    "Spatial drift (short mean deviation)": drift.meanDeviation[index],
  };
  useEffect(() => {
    let last = -Infinity,
      written = "";
    return subscribeFrame((t) => {
      if (t.now - last < 200 || !telemetry.current) return;
      last = t.now;
      const text = `progress ${t.progress.toFixed(5)} / local ${t.localProgress.toFixed(5)}\n${t.sceneId} / ${t.beatId}\nframe ${t.frameMs || "—"} ms / ${t.fps || "—"} fps\nquality ${t.quality}\ncamera ${t.camera}\ntheta ${t.theta}° / unwrap ${t.unwrap}\ndraws ${t.drawCalls} / triangles ${t.triangles}`;
      if (text === written) return;
      written = text;
      telemetry.current.textContent = text;
    });
  }, []);
  return (
    <details className={styles.debug} open>
      <summary>Development inspector · synthetic data</summary>
      <pre ref={telemetry} />
      <nav aria-label="Developer scene jump">
        {scenes.map((scene, i) => (
          <button key={scene.id} onClick={() => jump(i)}>
            {i} {scene.title}
          </button>
        ))}
      </nav>
      <label>
        Selected θ/360{" "}
        <input
          type="number"
          min="0"
          max="1"
          step=".01"
          value={u}
          onChange={(e) => setU(Number(e.target.value))}
        />
      </label>
      <label>
        Selected s/L{" "}
        <input
          type="number"
          min="0"
          max="1"
          step=".01"
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
        />
      </label>
      <dl>
        <div>
          <dt>Lineage</dt>
          <dd>
            {lineage.tyreId} · {lineage.sprayStation} ·{" "}
            {lineage.processTrace?.samples ?? 0} trace samples ·{" "}
            {lineage.processStatus} · {lineage.disposition} · review{" "}
            {lineage.review?.status ?? "none"}
          </dd>
        </div>
        {Object.entries(channels).map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{value?.toFixed(4) ?? "unavailable"}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
