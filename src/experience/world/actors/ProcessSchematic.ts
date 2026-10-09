import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import type { Object3D } from "three";

/**
 * Schematic spray geometry projected into the canonical map coordinate system of an analytical
 * plate (plate-local flat coordinates: x = (u - 0.5)·6, y = (0.5 - s)·2). Illustrative: an aim
 * line at s = aimS, a ±σ influence band, an outline nozzle glyph at the map edge and an optional
 * valve-opening tick at θ = sprayStartTheta.
 */
export const mapX = (thetaDegrees: number) => (thetaDegrees / 360 - 0.5) * 6;
export const mapY = (s: number) => (0.5 - s) * 2;

export interface SchematicGeometry {
  aimS: number;
  sigmaS: number;
  sprayStartTheta: number | null;
}

const AMBER = new Color("#d8a45c");
const RENDER_ORDER = 3;

function segments(points: number[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

/** Outline nozzle in world-sized units, tip at the origin pointing +x. */
function glyphGeometry() {
  const body = [-0.24, -0.11, 0.035];
  const [x0, x1, h] = body,
    tip = 0.014;
  return segments([
    x0, -h, 0, x1, -h, 0,
    x1, -h, 0, x1, h, 0,
    x1, h, 0, x0, h, 0,
    x0, h, 0, x0, -h, 0,
    x1, -h, 0, 0, -tip, 0,
    x1, h, 0, 0, tip, 0,
    0, -tip, 0, 0, tip, 0,
    x0, 0, 0, x0 - 0.08, 0, 0,
  ]);
}

export function createProcessSchematic() {
  const group = new Group();
  group.name = "process-schematic";
  group.visible = false;
  const bandMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: { uColor: { value: AMBER }, uOpacity: { value: 0 } },
    vertexShader: `varying float vY;void main(){vY=uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uColor;uniform float uOpacity;varying float vY;void main(){float d=(vY-.5)*6.;gl_FragColor=vec4(uColor,uOpacity*exp(-.5*d*d));}`,
  });
  const lineMaterial = new MeshBasicMaterial({
    color: AMBER,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    opacity: 0,
  });
  const outlineMaterial = new LineBasicMaterial({
    color: AMBER,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const plane = new PlaneGeometry(6, 1);
  const band = new Mesh(plane, bandMaterial);
  band.name = "process-schematic-influence";
  const aim = new Mesh(plane, lineMaterial);
  aim.name = "process-schematic-aim";
  const glyph = new LineSegments(glyphGeometry(), outlineMaterial);
  glyph.name = "process-schematic-nozzle";
  const tick = new LineSegments(
    segments([0, -0.12, 0, 0, 0.12, 0]),
    outlineMaterial,
  );
  tick.name = "process-schematic-valve-opening";
  for (const object of [band, aim, glyph, tick]) {
    object.renderOrder = RENDER_ORDER;
    object.frustumCulled = false;
    group.add(object);
  }
  let opacity = -1,
    current: SchematicGeometry | null = null;
  return {
    group,
    /** Places aim line, band and tick; call only when the projected geometry changes. */
    setGeometry(next: SchematicGeometry) {
      if (
        current &&
        current.aimS === next.aimS &&
        current.sigmaS === next.sigmaS &&
        current.sprayStartTheta === next.sprayStartTheta
      )
        return;
      current = { ...next };
      const y = mapY(next.aimS);
      aim.position.set(0, y, 0.001);
      band.position.set(0, y, 0);
      band.scale.y = 12 * next.sigmaS;
      glyph.position.y = y;
      tick.visible = next.sprayStartTheta !== null;
      if (next.sprayStartTheta !== null)
        tick.position.set(mapX(next.sprayStartTheta), y, 0.002);
    },
    setOpacity(value: number) {
      if (value === opacity) return;
      opacity = value;
      group.visible = value > 0.001;
      bandMaterial.uniforms.uOpacity.value = 0.32 * value;
      lineMaterial.opacity = 0.92 * value;
      outlineMaterial.opacity = 0.92 * value;
    },
    /**
     * Shares the plate's transform. Glyph, tick and line thickness are counter-scaled so they keep
     * a constant world size on the non-uniformly scaled plate. `inside` keeps the glyph within the
     * map edge where neighbouring plates leave no room (narrow viewports).
     */
    follow(plate: Object3D, glyphScale: number, inside: boolean) {
      group.position.set(plate.position.x, plate.position.y, plate.position.z + 0.02);
      group.scale.copy(plate.scale);
      const sx = plate.scale.x || 1,
        sy = plate.scale.y || 1;
      aim.scale.y = 0.011 / sy;
      glyph.scale.set(glyphScale / sx, glyphScale / sy, 1);
      glyph.position.x = inside ? -3 + (0.36 * glyphScale) / sx : -3 - 0.05 / sx;
      tick.scale.set(1, 1 / sy, 1);
    },
    dispose() {
      plane.dispose();
      glyph.geometry.dispose();
      tick.geometry.dispose();
      bandMaterial.dispose();
      lineMaterial.dispose();
      outlineMaterial.dispose();
    },
  };
}
export type ProcessSchematic = ReturnType<typeof createProcessSchematic>;
