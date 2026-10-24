"""Converte un emote Emotecraft (.emotecraft, formato binario playerAnimator) in keyframe CSS
per il personaggio 3D di components/staff/SkinFigure.tsx.

Si attiva passando il mouse sulla card (.group) di una figura con classe sk-dance-<nome>.
Uso: python3 scripts/emote-css.py scripts/emotes/get_the_griddy.emotecraft griddy > components/staff/emote-griddy.css

Assi: Minecraft ha z in avanti negativo, il CSS positivo verso chi guarda, quindi
pitch e yaw cambiano segno, roll resta uguale. Ordine di rotazione Z·Y·X come ModelPart.
"""
import struct, sys

path, name = sys.argv[1], sys.argv[2]
d = open(path, "rb").read()
p = 0
def i32():
    global p; v = struct.unpack(">i", d[p:p + 4])[0]; p += 4; return v
def f32():
    global p; v = struct.unpack(">f", d[p:p + 4])[0]; p += 4; return v

version = i32(); p += 4; i32()            # versione, header, dimensione
i32(); end = i32(); stop = i32(); i32()  # begin, end, stopTick, endTick
loop = d[p]; p += 1; ret = i32(); p += 3; nparts = i32()
AX = ["x", "y", "z", "pitch", "yaw", "roll", "bendDir", "bend"]
parts = {}
for _ in range(nparts):
    n = i32(); pname = d[p:p + n].decode(); p += n
    axes = {}
    for a in AX[: 6 if pname == "head" else 8]:
        en = d[p]; p += 1; c = i32(); kf = []
        for _ in range(max(c, 0)):
            t = i32(); v = f32(); e = d[p]; p += 1
            if e != 0: sys.exit(f"easing {e} non gestito")
            kf.append((t, v))
        if en and kf: axes[a] = kf
    parts[pname] = axes

T0, T1 = 1, stop  # il ciclo va da tick 1 a stopTick (20 tick al secondo)
DUR = (T1 - T0) / 20

def val(pn, ax, t):
    kf = parts.get(pn, {}).get(ax)
    if not kf: return 0.0
    if t <= kf[0][0]: return kf[0][1]
    for (ta, va), (tb, vb) in zip(kf, kf[1:]):
        if ta <= t <= tb: return va + (vb - va) * (t - ta) / (tb - ta)
    return kf[-1][1]

def ticks(pn, axs):
    s = {T0, T1}
    for a in axs:
        for t, _ in parts.get(pn, {}).get(a, []):
            if T0 <= t <= T1: s.add(t)
    return sorted(s)

deg = lambda r: f"{r * 57.29578:.2f}deg"
out = [f"/* Emote \"{name}\" convertito da Emotecraft (autore originale: SeroRonin). Generato da scripts/emote-css.py: non modificare a mano. */"]

def emit(anim, pn, axs, fn):
    out.append(f"@keyframes sk-{name}-{anim} {{")
    for t in ticks(pn, axs):
        out.append(f"  {(t - T0) / (T1 - T0) * 100:.2f}% {{ transform: {fn(lambda a: val(pn, a, t))}; }}")
    out.append("}")

rot = lambda v: f"rotateZ({deg(v('roll'))}) rotateY({deg(-v('yaw'))}) rotateX({deg(-v('pitch'))})"
bend = lambda v: f"rotateX({deg(-v('bend'))})"
MAP = {"head": "head", "rightArm": "rarm", "leftArm": "larm", "rightLeg": "rleg", "leftLeg": "lleg"}
sel = []
for mc, css in MAP.items():
    emit(css, mc, ["roll", "yaw", "pitch"], rot)
    sel.append((f".sk-{css}", f"sk-{name}-{css}"))
    if mc != "head":
        emit(f"{css}-bend", mc, ["bend"], bend)
        sel.append((f".sk-{css} .sk-seg-lower", f"sk-{name}-{css}-bend"))
# Busto: la parte alta (testa, braccia, metà superiore) si piega, tutto il corpo oscilla e molleggia
emit("upper", "body", ["bend"], bend)
sel.append((".sk-upper", f"sk-{name}-upper"))
emit("rig", "body", ["y", "roll", "yaw", "pitch"],
     lambda v: f"translateY(calc(var(--px) * {-v('y') * 16:.2f})) " + rot(v))
sel.append((".sk-rig", f"sk-{name}-rig"))

for s, a in sel:
    out.append(f".group:hover .sk-dance-{name} {s} {{ animation: {a} {DUR:.2f}s linear infinite; }}")
print("\n".join(out))
