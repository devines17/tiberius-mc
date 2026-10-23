import type { CSSProperties } from "react";
import type { Skin } from "@/lib/skins";

/**
 * Personaggio Minecraft in 3D fatto solo di CSS: un modello "vuoto" in posa
 * su cui viene applicata la texture della skin. Nessuna immagine pre-renderizzata.
 *
 * Unità: 1 pixel della skin = var(--px). Le coordinate seguono il formato 64x64.
 */

type Box = { w: number; h: number; d: number; u: number; v: number };
type Face = "front" | "back" | "right" | "left" | "top" | "bottom";

function faceRect(b: Box, f: Face): [x: number, y: number, w: number, h: number] {
  const { w, h, d, u, v } = b;
  switch (f) {
    case "top":
      return [u + d, v, w, d];
    case "bottom":
      return [u + d + w, v, w, d];
    case "right":
      return [u, v + d, d, h];
    case "front":
      return [u + d, v + d, w, h];
    case "left":
      return [u + d + w, v + d, d, h];
    case "back":
      return [u + 2 * d + w, v + d, w, h];
  }
}

const FACES: Face[] = ["front", "back", "right", "left", "top", "bottom"];

function Cuboid({ box, scale = 1, mirror = false, className = "" }: { box: Box; scale?: number; mirror?: boolean; className?: string }) {
  return (
    <div
      className={`sk-cube ${className}`}
      style={{ "--w": box.w, "--h": box.h, "--d": box.d, transform: scale === 1 ? undefined : `scale3d(${scale},${scale},${scale})` } as CSSProperties}
    >
      {FACES.map((f) => {
        // Arto specchiato (skin 64x32): i lati destro e sinistro si scambiano e la texture si ribalta
        const src: Face = mirror && f === "left" ? "right" : mirror && f === "right" ? "left" : f;
        const [x, y, w, h] = faceRect(box, src);
        return <span key={f} className={`sk-face sk-${f}${mirror ? " sk-mirror" : ""}`} style={{ "--fw": w, "--fh": h, "--fx": x, "--fy": y } as CSSProperties} />;
      })}
    </div>
  );
}

function Part({ name, base, overlay, overlayScale, mirror }: { name: string; base: Box; overlay?: Box; overlayScale: number; mirror?: boolean }) {
  return (
    <div className={`sk-part sk-${name}`} style={{ "--w": base.w, "--h": base.h, "--d": base.d } as CSSProperties}>
      <Cuboid box={base} mirror={mirror} />
      {overlay && <Cuboid box={overlay} scale={overlayScale} mirror={mirror} className="sk-overlay" />}
    </div>
  );
}

const POSES = ["cammina", "saluta", "rilassato", "saluto_frontale"] as const;

export function SkinFigure({ skin, pose = 0 }: { skin: Skin; pose?: number | (typeof POSES)[number] }) {
  const poseClass = typeof pose === "number" ? POSES[pose % 3] : pose;
  const a = skin.slim ? 3 : 4;
  const L = skin.legacy;
  return (
    <div
      className={`sk-stage sk-pose-${poseClass}`}
      style={{ "--skin": `url("${skin.url}")`, "--sh": L ? 32 : 64, "--arm": a } as CSSProperties}
      role="img"
      aria-label={`Skin di ${skin.name}`}
    >
      <div className="sk-figure">
        {/* Nelle vecchie skin 64x32 lo strato del cappello è spesso pieno (nero): Minecraft lo ignora, qui lo omettiamo */}
        <Part name="head" base={{ w: 8, h: 8, d: 8, u: 0, v: 0 }} overlay={L ? undefined : { w: 8, h: 8, d: 8, u: 32, v: 0 }} overlayScale={1.125} />
        <Part name="body" base={{ w: 8, h: 12, d: 4, u: 16, v: 16 }} overlay={L ? undefined : { w: 8, h: 12, d: 4, u: 16, v: 32 }} overlayScale={1.07} />
        <Part name="rarm" base={{ w: a, h: 12, d: 4, u: 40, v: 16 }} overlay={L ? undefined : { w: a, h: 12, d: 4, u: 40, v: 32 }} overlayScale={1.08} />
        <Part
          name="larm"
          base={L ? { w: a, h: 12, d: 4, u: 40, v: 16 } : { w: a, h: 12, d: 4, u: 32, v: 48 }}
          overlay={L ? undefined : { w: a, h: 12, d: 4, u: 48, v: 48 }}
          overlayScale={1.08}
          mirror={L}
        />
        <Part name="rleg" base={{ w: 4, h: 12, d: 4, u: 0, v: 16 }} overlay={L ? undefined : { w: 4, h: 12, d: 4, u: 0, v: 32 }} overlayScale={1.08} />
        <Part
          name="lleg"
          base={L ? { w: 4, h: 12, d: 4, u: 0, v: 16 } : { w: 4, h: 12, d: 4, u: 16, v: 48 }}
          overlay={L ? undefined : { w: 4, h: 12, d: 4, u: 0, v: 48 }}
          overlayScale={1.08}
          mirror={L}
        />
      </div>
    </div>
  );
}
