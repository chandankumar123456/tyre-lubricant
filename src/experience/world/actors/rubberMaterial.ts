import { seededRandom } from "../../surface/SurfaceGenerator";
import {
  DataTexture,
  RGBAFormat,
  UnsignedByteType,
  RepeatWrapping,
  LinearFilter,
  NoColorSpace,
} from "three";
/** Project-owned rubber microtexture, unrelated to the measured optical SurfaceField. */
export function createRubberMicrotexture() {
  const side = 128,
    bytes = new Uint8Array(side * side * 4),
    random = seededRandom("independent-rubber-material");
  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      const index = (y * side + x) * 4;
      const grain =
        130 + (random() - 0.5) * 60 + Math.sin(x * 0.27 + y * 0.7) * 5;
      bytes[index] = bytes[index + 1] = bytes[index + 2] = grain;
      bytes[index + 3] = 255;
    }
  const texture = new DataTexture(
    bytes,
    side,
    side,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(8, 3);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}
