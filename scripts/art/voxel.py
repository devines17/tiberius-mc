"""
Scene isometriche a blocchi per Tiberius MC.

Disegna in codice un unico linguaggio grafico (cubi isometrici, stile
Minecraft) e salva PNG trasparenti in public/images/art/.
Uso: python3 scripts/art/voxel.py
"""
import math
import os
import random

from PIL import Image, ImageDraw

TW, TH, CH = 84, 42, 42  # larghezza/altezza del rombo, altezza del cubo
SS = 2  # supersampling per bordi lisci
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "images", "art")


class Mat:
    def __init__(self, top, side=None, strip=None, jitter=0.05):
        self.top, self.side, self.strip, self.jitter = top, side or top, strip, jitter


MATS = {
    "grass": Mat((112, 172, 82), (140, 96, 62), strip=(112, 172, 82)),
    "dirt": Mat((140, 96, 62)),
    "stone": Mat((152, 152, 156)),
    "dstone": Mat((96, 96, 104)),
    "marble": Mat((238, 234, 224), jitter=0.025),
    "marble2": Mat((214, 208, 196), jitter=0.025),
    "roof": Mat((184, 40, 32)),
    "wood": Mat((128, 84, 42)),
    "plank": Mat((182, 134, 78)),
    "leaf": Mat((64, 134, 54), jitter=0.09),
    "gold": Mat((247, 186, 22), jitter=0.02),
    "water": Mat((70, 146, 210), jitter=0.03),
    "banner": Mat((206, 34, 28), jitter=0.02),
    "blue": Mat((40, 62, 140), jitter=0.02),
    "sand": Mat((224, 200, 142)),
    "road": Mat((178, 170, 156)),
    "door": Mat((58, 36, 22), jitter=0.01),
    "window": Mat((34, 44, 66), jitter=0.01),
    "fire": Mat((255, 128, 28), jitter=0.12),
    "skin": Mat((232, 182, 142), jitter=0.02),
    "black": Mat((18, 18, 20), jitter=0.01),
}


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c[:3])


def P(x, y, z):
    return ((x - y) * TW / 2, (x + y) * TH / 2 - z * CH)


def render(world, name, max_w=1500, seed=3, pad=28):
    rnd = random.Random(seed)
    xs, ys = [], []
    for (x, y, z) in world:
        for dx in (0, 1):
            for dy in (0, 1):
                for dz in (0, 1):
                    px, py = P(x + dx, y + dy, z + dz)
                    xs.append(px)
                    ys.append(py)
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    W = int((maxx - minx + pad * 2) * SS)
    H = int((maxy - miny + pad * 2) * SS)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def T(pt):
        return ((pt[0] - minx + pad) * SS, (pt[1] - miny + pad) * SS)

    order = sorted(world, key=lambda k: (k[0] + k[1] + k[2], k[2], k[0]))
    for (x, y, z) in order:
        m = MATS[world[(x, y, z)]]
        j = 1 + rnd.uniform(-m.jitter, m.jitter)
        show_top = (x, y, z + 1) not in world
        show_l = (x, y + 1, z) not in world
        show_r = (x + 1, y, z) not in world
        if show_l:
            poly = [T(P(x, y + 1, z + 1)), T(P(x + 1, y + 1, z + 1)), T(P(x + 1, y + 1, z)), T(P(x, y + 1, z))]
            col = shade(m.side, 0.82 * j)
            d.polygon(poly, fill=col + (255,), outline=shade(col, 0.78) + (255,))
            if m.strip:
                sp = [T(P(x, y + 1, z + 1)), T(P(x + 1, y + 1, z + 1)), T(P(x + 1, y + 1, z + 0.72)), T(P(x, y + 1, z + 0.72))]
                d.polygon(sp, fill=shade(m.strip, 0.82 * j) + (255,))
        if show_r:
            poly = [T(P(x + 1, y, z + 1)), T(P(x + 1, y + 1, z + 1)), T(P(x + 1, y + 1, z)), T(P(x + 1, y, z))]
            col = shade(m.side, 0.62 * j)
            d.polygon(poly, fill=col + (255,), outline=shade(col, 0.8) + (255,))
            if m.strip:
                sp = [T(P(x + 1, y, z + 1)), T(P(x + 1, y + 1, z + 1)), T(P(x + 1, y + 1, z + 0.72)), T(P(x + 1, y, z + 0.72))]
                d.polygon(sp, fill=shade(m.strip, 0.62 * j) + (255,))
        if show_top:
            poly = [T(P(x, y, z + 1)), T(P(x + 1, y, z + 1)), T(P(x + 1, y + 1, z + 1)), T(P(x, y + 1, z + 1))]
            col = shade(m.top, 1.0 * j)
            d.polygon(poly, fill=col + (255,), outline=shade(col, 0.86) + (255,))

    img = img.resize((W // SS, H // SS), Image.LANCZOS)
    bb = img.getchannel("A").getbbox()
    img = img.crop(bb)
    if img.width > max_w:
        img = img.resize((max_w, int(img.height * max_w / img.width)), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    img.save(path, optimize=True)
    print(name, img.size, os.path.getsize(path) // 1024, "KB")


# ---------------------------------------------------------------- helpers
def box(w, x0, y0, z0, x1, y1, z1, m):
    for x in range(x0, x1):
        for y in range(y0, y1):
            for z in range(z0, z1):
                w[(x, y, z)] = m


def island(w, n, depth, seed=1, top="grass"):
    rnd = random.Random(seed)
    c = (n - 1) / 2
    for k in range(depth + 1):
        r = n / 2 - k * 0.95
        for x in range(n):
            for y in range(n):
                dx, dy = abs(x - c) / r, abs(y - c) / r
                v = dx ** 4 + dy ** 4 + rnd.uniform(-0.07, 0.07)
                if v < 1:
                    z = -k
                    if k == 0:
                        w[(x, y, z)] = top
                    elif k < 2:
                        w[(x, y, z)] = "dirt"
                    else:
                        w[(x, y, z)] = "stone" if rnd.random() < 0.5 else "dirt"


def house(w, x, y, wd, dp, h, z0=1, wall="plank", roof="roof"):
    box(w, x, y, z0, x + wd, y + dp, z0 + h, wall)
    w[(x + wd // 2, y + dp - 1, z0)] = "door"
    w[(x + wd // 2, y + dp - 1, z0 + 1)] = "door"
    w[(x + wd - 1, y + dp // 2, z0 + 1)] = "window"
    if wd > 3:
        w[(x + 1, y + dp - 1, z0 + 1)] = "window"
    rx0, rx1, ry0, ry1, z = x - 1, x + wd + 1, y - 1, y + dp + 1, z0 + h
    while rx0 < rx1 and ry0 < ry1:
        box(w, rx0, ry0, z, rx1, ry1, z + 1, roof)
        rx0, rx1, ry0, ry1, z = rx0 + 1, rx1 - 1, ry0 + 1, ry1 - 1, z + 1


def tree(w, x, y, z0=1, seed=0):
    rnd = random.Random(seed + x * 7 + y)
    box(w, x, y, z0, x + 1, y + 1, z0 + 3, "wood")
    for dx in range(-1, 2):
        for dy in range(-1, 2):
            for dz in range(2):
                if abs(dx) + abs(dy) == 2 and rnd.random() < 0.45:
                    continue
                w[(x + dx, y + dy, z0 + 3 + dz)] = "leaf"
    w[(x, y, z0 + 5)] = "leaf"


def column(w, x, y, z0, h):
    w[(x, y, z0)] = "marble2"
    box(w, x, y, z0 + 1, x + 1, y + 1, z0 + h - 1, "marble")
    w[(x, y, z0 + h - 1)] = "marble2"


def banner(w, x, y, z0, h, m="banner"):
    box(w, x, y, z0, x + 1, y + 1, z0 + h, "wood")
    box(w, x + 1, y, z0 + h - 3, x + 2, y + 1, z0 + h, m)
    box(w, x + 2, y, z0 + h - 2, x + 3, y + 1, z0 + h, m)
    w[(x, y, z0 + h)] = "gold"


def soldier(w, x, y, z0, m="banner", helmet="gold"):
    w[(x, y, z0)] = "dstone"
    w[(x, y, z0 + 1)] = m
    w[(x, y, z0 + 2)] = helmet


# ----------------------------------------------------------------- scenes
def scene_village():
    w = {}
    island(w, 15, 4, seed=4)
    # sentiero
    for i in range(3, 12):
        w[(i, 7, 0)] = "sand"
    for j in range(2, 8):
        w[(7, j, 0)] = "sand"
    house(w, 2, 2, 4, 3, 2)
    house(w, 9, 3, 3, 3, 2, roof="roof")
    house(w, 4, 9, 4, 3, 2, wall="plank")
    tree(w, 12, 10, seed=1)
    tree(w, 1, 8, seed=2)
    tree(w, 11, 1, seed=3)
    # pozzo
    for dx in range(3):
        for dy in range(3):
            if (dx, dy) != (1, 1):
                w[(8 + dx, 8 + dy, 1)] = "stone"
    w[(9, 9, 0)] = "water"
    # falo
    w[(7, 5, 1)] = "fire"
    w[(7, 5, 2)] = "fire"
    for dx, dy in ((6, 5), (8, 5), (7, 4), (7, 6)):
        w[(dx, dy, 1)] = "dstone"
    render(w, "village.png", max_w=1400)


def scene_town():
    w = {}
    island(w, 19, 5, seed=7)
    # mura
    n = 17
    for i in range(1, n + 1):
        for (x, y) in ((i, 1), (i, n), (1, i), (n, i)):
            if y == n and 7 <= x <= 11:
                continue  # porta
            box(w, x, y, 1, x + 1, y + 1, 4, "stone")
            if (x + y) % 2 == 0:
                w[(x, y, 4)] = "stone"
    # porta ad arco
    box(w, 6, n, 1, 7, n + 1, 6, "marble")
    box(w, 11, n, 1, 12, n + 1, 6, "marble")
    box(w, 7, n, 4, 11, n + 1, 5, "marble")
    box(w, 7, n, 5, 11, n + 1, 6, "marble2")
    w[(9, n, 6)] = "gold"
    # strada
    for y in range(8, n + 1):
        for x in range(8, 11):
            w[(x, y, 0)] = "road"
    # foro: podio, colonne, frontone
    box(w, 5, 4, 1, 14, 9, 2, "marble2")
    box(w, 6, 5, 2, 13, 8, 3, "marble")
    for x in range(6, 13, 2):
        column(w, x, 5, 3, 5)
        column(w, x, 7, 3, 5)
    box(w, 6, 5, 8, 13, 8, 9, "marble2")
    for k in range(3):
        box(w, 6 + k, 5, 9 + k, 13 - k, 8, 10 + k, "marble" if k % 2 == 0 else "marble2")
    w[(9, 6, 12)] = "gold"
    # case
    house(w, 2, 11, 3, 3, 2, roof="roof")
    house(w, 14, 11, 3, 3, 2, roof="roof")
    house(w, 2, 4, 3, 3, 2, wall="plank")
    # stendardi
    banner(w, 4, 9, 1, 8)
    banner(w, 14, 9, 1, 8)
    # fontana
    for dx in range(3):
        for dy in range(3):
            w[(12 + dx - 5, 12 + dy, 1)] = "marble2" if (dx, dy) != (1, 1) else "water"
    tree(w, 15, 4, seed=9)
    tree(w, 3, 15, seed=8)
    render(w, "town.png", max_w=1500)


def scene_empire():
    w = {}
    island(w, 38, 6, seed=11)
    # strada romana dal fronte al Colosseo
    for y in range(18, 38):
        for x in range(17, 21):
            if (x, y, 0) in w:
                w[(x, y, 0)] = "road"
    # Colosseo: anello ellittico a tre ordini di arcate
    cx, cy, rx, ry = 18.0, 12.0, 10.5, 8.0
    ring = []
    for x in range(0, 38):
        for y in range(0, 38):
            r = math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
            if 0.74 <= r <= 1.03:
                ring.append((x, y))
            elif r < 0.74:
                w[(x, y, 0)] = "sand"
    for t in range(3):
        base = 1 + t * 2
        for (x, y) in ring:
            hole = (x + y) % 2 == 0 and t < 2
            if not hole:
                w[(x, y, base)] = "marble"
            else:
                w[(x, y, base)] = "dstone"
            w[(x, y, base + 1)] = "marble2" if (x + y) % 2 else "marble"
    for (x, y) in ring:
        w[(x, y, 7)] = "marble"
    # arco di trionfo
    ax, ay = 4, 27
    box(w, ax, ay, 1, ax + 11, ay + 3, 11, "marble")
    for dz in range(6):
        for dx in range(5):
            for dy in range(3):
                if dz == 5 and dx in (0, 4):
                    continue
                w.pop((ax + 3 + dx, ay + dy, 1 + dz), None)
    for dz in range(3):
        for dy in range(3):
            w.pop((ax + 1, ay + dy, 1 + dz), None)
            w.pop((ax + 9, ay + dy, 1 + dz), None)
    box(w, ax - 1, ay - 1, 11, ax + 12, ay + 4, 12, "marble2")
    box(w, ax + 4, ay + 1, 12, ax + 7, ay + 2, 14, "gold")
    # acquedotto sul fondo
    L, ay2 = 30, 1
    for x in range(L):
        u = x % 4
        if u == 0:
            box(w, x, ay2, 1, x + 1, ay2 + 2, 6, "stone")
            box(w, x, ay2, 6, x + 1, ay2 + 2, 10, "stone")
        if u in (1, 3):
            box(w, x, ay2, 4, x + 1, ay2 + 2, 6, "stone")
            box(w, x, ay2, 8, x + 1, ay2 + 2, 10, "stone")
        box(w, x, ay2, 10, x + 1, ay2 + 2, 11, "stone")
        w[(x, ay2, 11)] = "stone"
        w[(x, ay2 + 1, 11)] = "water"
    # case, torri, stendardi
    house(w, 22, 27, 4, 3, 2, roof="roof")
    house(w, 29, 29, 3, 3, 2, roof="roof")
    house(w, 4, 18, 4, 3, 2, wall="plank")
    house(w, 30, 12, 4, 3, 3, wall="marble", roof="roof")
    for (tx, ty) in ((33, 20), (1, 8)):
        box(w, tx, ty, 1, tx + 2, ty + 2, 8, "marble")
        box(w, tx - 1, ty - 1, 8, tx + 3, ty + 3, 9, "marble2")
        banner(w, tx, ty, 9, 5)
    banner(w, 16, 31, 1, 9)
    banner(w, 21, 31, 1, 9, m="blue")
    tree(w, 25, 33, seed=5)
    tree(w, 1, 24, seed=6)
    tree(w, 33, 8, seed=7)
    tree(w, 12, 33, seed=8)
    render(w, "empire.png", max_w=1800)


def scene_siege():
    w = {}
    island(w, 21, 4, seed=5)
    # muro con breccia
    for x in range(2, 19):
        box(w, x, 10, 1, x + 1, 11, 6, "stone")
        if x % 2 == 0:
            w[(x, 10, 6)] = "stone"
    for x in range(8, 12):
        for z in range(1, 7):
            w.pop((x, 10, z), None)
    for (x, z) in ((8, 1), (9, 1), (11, 1), (9, 2), (10, 1)):
        w[(x, 10, z)] = "dstone"
    for tx in (1, 18):
        box(w, tx, 9, 1, tx + 2, 12, 9, "marble2")
        box(w, tx - 1, 8, 9, tx + 3, 13, 10, "stone")
        banner(w, tx, 9, 10, 5)
    # fuoco alla breccia
    for (x, z) in ((9, 2), (10, 2), (10, 3)):
        w[(x, 10, z)] = "fire"
    # assedianti
    rnd = random.Random(2)
    for i in range(10):
        soldier(w, 3 + int(i * 1.5), 15 + rnd.randint(0, 3), 1)
    for i in range(6):
        soldier(w, 4 + i * 2, 5 + rnd.randint(0, 1), 1, m="blue", helmet="skin")
    soldier(w, 9, 13, 1, helmet="gold")
    banner(w, 7, 15, 1, 6)
    # catapulta
    box(w, 13, 15, 1, 16, 17, 2, "wood")
    box(w, 14, 15, 2, 15, 17, 4, "plank")
    for k in range(4):
        w[(14, 17 - 1 - k // 2, 4 + k)] = "wood"
    w[(14, 14, 7)] = "dstone"
    tree(w, 18, 18, seed=3)
    tree(w, 2, 17, seed=4)
    render(w, "siege.png", max_w=1500)


def pixel_coin():
    rows = 16
    img = Image.new("RGBA", (rows, rows), (0, 0, 0, 0))
    px = img.load()
    for y in range(rows):
        for x in range(rows):
            r = math.hypot(x - 7.5, y - 7.5)
            if r > 7.7:
                continue
            c = (245, 184, 20)
            if r > 6.3:
                c = (176, 118, 10)
            elif (x + y) < 11 and r < 5.6 and r > 3.6:
                c = (255, 222, 96)
            px[x, y] = c + (255,)
    for x in range(5, 11):
        px[x, 4] = (206, 142, 8, 255)
        px[x, 5] = (206, 142, 8, 255)
    for y in range(6, 12):
        px[7, y] = (206, 142, 8, 255)
        px[8, y] = (206, 142, 8, 255)
    for (x, y) in ((4, 3), (3, 4)):
        px[x, y] = (255, 250, 220, 255)
    img = img.resize((rows * 40, rows * 40), Image.NEAREST)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, "goldone.png"), optimize=True)
    print("goldone.png", img.size)


if __name__ == "__main__":
    scene_village()
    scene_town()
    scene_empire()
    scene_siege()
    pixel_coin()
