import type { CSSProperties } from "react";
import type { Skin } from "@/lib/skins";

/**
 * Personaggio Minecraft in 3D fatto solo di CSS: un modello "vuoto" in posa
 * su cui viene applicata la texture della skin. Nessuna immagine pre-renderizzata.
 *
 * Unità: 1 pixel della skin = var(--px). Le coordinate seguono il formato 64x64.
 */

/** seg: metà superiore o inferiore di un arto alto 12 (per piegare il gomito). */
type Box = { w: number; h: number; d: number; u: number; v: number; seg?: "upper" | "lower" };
type Face = "front" | "back" | "right" | "left" | "top" | "bottom";

function faceRect(b: Box, f: Face): [x: number, y: number, w: number, h: number] {
  const { w, d, u, v, seg } = b;
  if (seg) {
    // Arto diviso in due metà da 6: i lati prendono metà texture, il taglio usa la faccia sotto
    const off = seg === "lower" ? 6 : 0;
    if (f === "top" && seg === "upper") return [u + d, v, w, d];
    if (f === "top" || f === "bottom") return [u + d + w, v, w, d];
    const full = faceRect({ w, h: 12, d, u, v }, f);
    return [full[0], full[1] + off, full[2], 6];
  }
  const h = b.h;
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

function Part({ name, base, overlay, overlayScale, mirror, elbow }: { name: string; base: Box; overlay?: Box; overlayScale: number; mirror?: boolean; elbow?: boolean }) {
  if (elbow) {
    // Arto con gomito: metà superiore fissa alla spalla, metà inferiore ruota dal gomito (--elbow)
    const seg = (b: Box, s: "upper" | "lower"): Box => ({ ...b, h: 6, seg: s });
    return (
      <div className={`sk-part sk-${name}`} style={{ "--w": base.w, "--h": base.h, "--d": base.d } as CSSProperties}>
        <div className="sk-seg" style={{ "--w": base.w, "--h": 6, "--d": base.d } as CSSProperties}>
          <Cuboid box={seg(base, "upper")} mirror={mirror} />
          {overlay && <Cuboid box={seg(overlay, "upper")} scale={overlayScale} mirror={mirror} className="sk-overlay" />}
        </div>
        <div className="sk-seg sk-seg-lower" style={{ "--w": base.w, "--h": 6, "--d": base.d } as CSSProperties}>
          <Cuboid box={seg(base, "lower")} mirror={mirror} />
          {overlay && <Cuboid box={seg(overlay, "lower")} scale={overlayScale} mirror={mirror} className="sk-overlay" />}
        </div>
      </div>
    );
  }
  return (
    <div className={`sk-part sk-${name}`} style={{ "--w": base.w, "--h": base.h, "--d": base.d } as CSSProperties}>
      <Cuboid box={base} mirror={mirror} />
      {overlay && <Cuboid box={overlay} scale={overlayScale} mirror={mirror} className="sk-overlay" />}
    </div>
  );
}

const POSES = ["cammina", "saluta", "rilassato", "saluto_frontale"] as const;
export type PoseName = (typeof POSES)[number] | "abbraccio-sx" | "abbraccio-dx";

/** Braccia con il gomito piegabile, per posa. */
const ELBOWS: Partial<Record<PoseName, ("rarm" | "larm")[]>> = {
  saluto_frontale: ["rarm"],
  "abbraccio-dx": ["larm"],
};

/** Il modello in posa, senza palcoscenico: si può mettere in una scena con altri personaggi. */
export function SkinModel({ skin, pose, className = "" }: { skin: Skin; pose: PoseName; className?: string }) {
  const a = skin.slim ? 3 : 4;
  const L = skin.legacy;
  const elbows = ELBOWS[pose] ?? [];
  return (
    <div className={`sk-figure sk-pose-${pose} ${className}`} style={{ "--skin": `url("${skin.url}")`, "--sh": L ? 32 : 64, "--arm": a } as CSSProperties}>
      {/* Nelle vecchie skin 64x32 lo strato del cappello è spesso pieno (nero): Minecraft lo ignora, qui lo omettiamo */}
      <Part name="head" base={{ w: 8, h: 8, d: 8, u: 0, v: 0 }} overlay={L ? undefined : { w: 8, h: 8, d: 8, u: 32, v: 0 }} overlayScale={1.125} />
      <Part name="body" base={{ w: 8, h: 12, d: 4, u: 16, v: 16 }} overlay={L ? undefined : { w: 8, h: 12, d: 4, u: 16, v: 32 }} overlayScale={1.07} />
      <Part name="rarm" base={{ w: a, h: 12, d: 4, u: 40, v: 16 }} overlay={L ? undefined : { w: a, h: 12, d: 4, u: 40, v: 32 }} overlayScale={1.08} elbow={elbows.includes("rarm")} />
      <Part
        name="larm"
        base={L ? { w: a, h: 12, d: 4, u: 40, v: 16 } : { w: a, h: 12, d: 4, u: 32, v: 48 }}
        overlay={L ? undefined : { w: a, h: 12, d: 4, u: 48, v: 48 }}
        overlayScale={1.08}
        mirror={L}
        elbow={elbows.includes("larm")}
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
  );
}

export function SkinFigure({ skin, pose = 0 }: { skin: Skin; pose?: number | PoseName }) {
  const poseName: PoseName = typeof pose === "number" ? POSES[pose % 3] : pose;
  return (
    <div className="sk-stage" role="img" aria-label={`Skin di ${skin.name}`}>
      <SkinModel skin={skin} pose={poseName} />
    </div>
  );
}

/** Due personaggi abbracciati nella stessa scena 3D (inquadratura dal basso). */
export function SkinDuo({ left, right }: { left: Skin; right: Skin }) {
  return (
    <div className="sk-duo" role="img" aria-label={`${left.name} e ${right.name} abbracciati`}>
      <div className="sk-duo-scene">
        <SkinModel skin={left} pose="abbraccio-sx" className="sk-duo-left" />
        <SkinModel skin={right} pose="abbraccio-dx" className="sk-duo-right" />
      </div>
    </div>
  );
}
