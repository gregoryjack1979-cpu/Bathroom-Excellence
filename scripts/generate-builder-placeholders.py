#!/usr/bin/env python3
"""
Generates the art for the Bathroom Design Builder.

The three room backgrounds come from a supplier render of the blue room
(scripts/source/room-blue.png): cropped to 4:3, scaled to the 1600x1200
canvas, and hue-shifted for the green and grey variants. That render already
shows one design — shower, smooth white walls, sliding glass door, chrome —
which is the builder's starting configuration, so nothing is drawn over it
until the user changes something inside the shower.

Every other layer is placeholder art drawn on the same canvas, positioned to
sit exactly on the render's shower alcove. Real product photography should
be supplied at the same canvas size with transparency outside the product —
drop the file in at the same path and nothing else needs to change.

    python3 scripts/generate-builder-placeholders.py

Requires Pillow.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / "public" / "assets"
SOURCE_ROOM = HERE / "source" / "room-blue.png"

# ── shared canvas geometry (measured off the source render) ──────────────────
W, H = 1600, 1200
AX0, AX1 = 439, 1155   # shower alcove opening, left / right
AY0, AY1 = 0, 1108     # alcove top (runs off the frame) / alcove floor
BX0, BX1 = 470, 1130   # back wall between the two shallow return walls
PAN_TOP = 985          # top of the shower pan
TUB_TOP = 830          # top of a bathtub in the same alcove
HEAD = (985, 150)      # rain head centre
VALVE = (1024, 556)    # valve plate centre
SPOUT_Y = 770
RAIL_Y0, RAIL_Y1 = 88, 121
ROLLER_XS = (478, 790, 1093)
PANELS = [(AX0 + 8, 800), (780, AX1 - 8)]
BAR_Y = 600            # horizontal door grip
THUMB = (480, 360)

METALS = {
    "chrome":         {"hi": "#f4f6f8", "mid": "#c7ced4", "lo": "#7f8b95"},
    "matte-black":    {"hi": "#4a4a4a", "mid": "#2a2a2a", "lo": "#141414"},
    "brushed-nickel": {"hi": "#e8e3dc", "mid": "#bdb6ac", "lo": "#847c72"},
}

STONES = {
    "white":       (243, 243, 240),
    "sandstone":   (216, 201, 168),
    "silverstone": (185, 190, 194),
    "limestone":   (207, 197, 176),
    "ridgestone":  (157, 154, 148),
}

MARBLES = {
    "venatino":         {"base": (246, 246, 244), "vein": (150, 156, 162), "bold": 0.6},
    "calcutta":         {"base": (248, 247, 244), "vein": (120, 126, 132), "bold": 1.0},
    "calcutta-vintage": {"base": (240, 234, 222), "vein": (150, 138, 118), "bold": 0.9},
    "calcutta-gold":    {"base": (247, 245, 240), "vein": (178, 148, 92),  "bold": 0.8},
    "carrara":          {"base": (236, 238, 238), "vein": (158, 164, 170), "bold": 0.5},
}

# grout pattern id -> (tile w, tile h, style)   sizes in px (≈6.7 px per inch on this canvas)
GROUT_PATTERNS = {
    "12x12":          (80, 80, "grid"),
    "11x20":          (134, 74, "brick"),
    "3x6":            (40, 20, "brick"),
    "3x6-vertical":   (20, 40, "brick-v"),
    "6x12":           (80, 40, "brick"),
    "6x12-vertical":  (40, 80, "brick-v"),
    "6x24":           (160, 40, "brick"),
    "12x24":          (160, 80, "brick"),
    "12x24-vertical": (80, 160, "brick-v"),
    "trendz":         (54, 54, "diamond"),
    "herringbone":    (40, 20, "herringbone"),
    "hexagon":        (0, 0, "hexagon"),
}
GROUT_COLORS = {"black": (29, 29, 29, 230), "silver": (200, 204, 208, 235)}


def hexrgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def new_layer() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def save(img: Image.Image, rel: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if rel.endswith(".jpg"):
        img.convert("RGB").save(path, "JPEG", quality=88, optimize=True, progressive=True)
    else:
        img.save(path, "PNG", optimize=True)
    print(f"  {rel}")


def vgradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        c = lerp(top, bottom, y / max(1, h - 1))
        for x in range(w):
            px[x, y] = c
    return img


def metal_bar(draw: ImageDraw.ImageDraw, box, metal, vertical=False):
    """A bar shaded like turned metal — gradient across its short axis."""
    x0, y0, x1, y1 = box
    hi, mid, lo = (hexrgb(metal[k]) for k in ("hi", "mid", "lo"))
    n = (x1 - x0) if vertical else (y1 - y0)
    for i in range(n):
        t = i / max(1, n - 1)
        c = lerp(hi, mid, t * 2) if t < 0.5 else lerp(mid, lo, (t - 0.5) * 2)
        if t > 0.82:
            c = lerp(c, hi, (t - 0.82) * 1.6)
        if vertical:
            draw.line([(x0 + i, y0), (x0 + i, y1)], fill=c)
        else:
            draw.line([(x0, y0 + i), (x1, y0 + i)], fill=c)


def metal_disc(draw, cx, cy, r, metal):
    hi, mid, lo = (hexrgb(metal[k]) for k in ("hi", "mid", "lo"))
    for i in range(r, 0, -1):
        t = 1 - i / r
        c = lerp(lo, mid, t) if t < 0.6 else lerp(mid, hi, (t - 0.6) * 2.5)
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=c)


def soft_shadow(base: Image.Image, box, alpha=90, blur=18):
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle(box, fill=(0, 0, 0, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(base, sh)


# ───────────────────────────── rooms (from the supplier render) ─────────────────────────────
def load_room_source() -> Image.Image:
    src = Image.open(SOURCE_ROOM).convert("RGB")
    w, h = src.size
    cw = int(h * 4 / 3)             # crop to 4:3 from the left edge — keeps picture, shower, vanity
    src = src.crop((0, 0, min(cw, w), h))
    return src.resize((W, H), Image.LANCZOS)


def recolor_room(img: Image.Image, mode: str) -> Image.Image:
    """Shift the blue wall paint to green or grey; everything else keeps its colour."""
    if mode == "blue":
        return img
    hsv = img.convert("HSV")
    h, s, v = hsv.split()
    # the paint sits in a narrow blue hue band and is reasonably saturated
    mask = Image.eval(h, lambda x: 255 if 122 <= x <= 168 else 0)
    smask = Image.eval(s, lambda x: 255 if x >= 55 else 0)
    from PIL import ImageChops
    mask = ImageChops.multiply(mask, smask).filter(ImageFilter.GaussianBlur(1.2))
    if mode == "green":
        h2 = Image.eval(h, lambda x: (x - 92) % 256)
        s2 = Image.eval(s, lambda x: int(x * 0.8))
        v2 = Image.eval(v, lambda x: min(255, int(x * 1.02)))
    else:  # grey
        h2 = h
        s2 = Image.eval(s, lambda x: int(x * 0.16))
        v2 = Image.eval(v, lambda x: min(255, int(x * 1.16) + 8))
    out = Image.merge("HSV", (h2, s2, v2)).convert("RGB")
    return Image.composite(out, img, mask)


# ───────────────────────────── walls ─────────────────────────────
def shade_returns(layer: Image.Image) -> Image.Image:
    """Darken the two shallow return walls so the alcove reads as recessed."""
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    for i in range(BX0 - AX0):
        a = int(96 * (1 - i / (BX0 - AX0)))
        d.line([(AX0 + i, AY0), (AX0 + i, AY1)], fill=(0, 0, 0, a))
    for i in range(AX1 - BX1):
        a = int(96 * (1 - i / (AX1 - BX1)))
        d.line([(AX1 - i, AY0), (AX1 - i, AY1)], fill=(0, 0, 0, a))
    d.line([(BX0, AY0), (BX0, AY1)], fill=(0, 0, 0, 60), width=2)
    d.line([(BX1, AY0), (BX1, AY1)], fill=(0, 0, 0, 60), width=2)
    return Image.alpha_composite(layer, sh)


def stone_fill(size, color, seed=1, speckle=0.06):
    w, h = size
    img = vgradient((w, h), lerp(color, (255, 255, 255), 0.06), lerp(color, (0, 0, 0), 0.06)).convert("RGBA")
    noise = Image.effect_noise((w, h), 26).convert("L")
    tint = Image.new("RGBA", (w, h), color + (255,))
    grain = Image.composite(tint, Image.new("RGBA", (w, h), lerp(color, (0, 0, 0), 0.25) + (255,)), noise)
    return Image.blend(img, grain, speckle)


def marble_fill(size, spec, seed=3):
    w, h = size
    base = stone_fill((w, h), spec["base"], seed, speckle=0.03)
    veins = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(veins)
    rng = random.Random(seed)
    count = int(10 * spec["bold"]) + 4
    for _ in range(count):
        x, y = rng.uniform(-w * 0.2, w * 1.2), rng.uniform(-h * 0.1, h * 0.3)
        pts = [(x, y)]
        angle = rng.uniform(math.radians(55), math.radians(125))
        for _ in range(rng.randint(18, 34)):
            angle += rng.uniform(-0.55, 0.55)
            step = rng.uniform(28, 70)
            x, y = x + math.cos(angle) * step, y + math.sin(angle) * step
            pts.append((x, y))
        width = rng.choice([1, 1, 2, 3, 4]) if spec["bold"] > 0.7 else rng.choice([1, 1, 2])
        alpha = rng.randint(70, 150)
        d.line(pts, fill=spec["vein"] + (alpha,), width=width, joint="curve")
        if rng.random() < 0.5:
            branch = pts[rng.randint(3, len(pts) - 3) :]
            branch = [(px + rng.uniform(-30, 30), py + rng.uniform(-10, 30)) for px, py in branch]
            d.line(branch, fill=spec["vein"] + (alpha // 2,), width=1, joint="curve")
    veins = veins.filter(ImageFilter.GaussianBlur(1.1))
    return Image.alpha_composite(base, veins)


def wall_layer(fill_img: Image.Image) -> Image.Image:
    layer = new_layer()
    layer.paste(fill_img, (AX0, AY0))
    return shade_returns(layer)


# ───────────────────────────── grout patterns ─────────────────────────────
def draw_grid(d, box, tw, th, color, stagger=False, vertical=False, width=2):
    x0, y0, x1, y1 = box
    if vertical:
        col = 0
        for x in range(x0, x1, tw):
            d.line([(x, y0), (x, y1)], fill=color, width=width)
            off = th // 2 if (stagger and col % 2) else 0
            for y in range(y0 - th + off, y1 + th, th):
                d.line([(x, y), (min(x + tw, x1), y)], fill=color, width=width)
            col += 1
    else:
        row = 0
        for y in range(y0, y1, th):
            d.line([(x0, y), (x1, y)], fill=color, width=width)
            off = tw // 2 if (stagger and row % 2) else 0
            for x in range(x0 - tw + off, x1 + tw, tw):
                d.line([(x, y), (x, min(y + th, y1))], fill=color, width=width)
            row += 1
    d.rectangle(box, outline=color, width=width)


def draw_hex(d, box, r, color):
    x0, y0, x1, y1 = box
    dx, dy = math.sqrt(3) * r, 1.5 * r
    row, y = 0, y0
    while y < y1 + r:
        off = dx / 2 if row % 2 else 0
        x = x0 + off
        while x < x1 + dx:
            pts = [(x + r * math.cos(math.radians(60 * k - 30)), y + r * math.sin(math.radians(60 * k - 30))) for k in range(6)]
            pts = [(min(max(px, x0), x1), min(max(py, y0), y1)) for px, py in pts]
            d.polygon(pts, outline=color)
            x += dx
        y += dy
        row += 1


def draw_diamond(d, box, s, color, width=2):
    x0, y0, x1, y1 = box
    span = (x1 - x0) + (y1 - y0)
    for k in range(-span, span, s):
        d.line([(x0 + k, y0), (x0 + k + (y1 - y0), y1)], fill=color, width=width)
        d.line([(x0 + k, y1), (x0 + k + (y1 - y0), y0)], fill=color, width=width)


def draw_herringbone(box, unit, color, canvas, width=2) -> Image.Image:
    """Bricks 2u x u laid in the classic 45° herringbone, clipped to `box`."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    side = int(math.hypot(bw, bh)) + 4 * unit
    tile = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    n = side // unit + 4
    # cell (x,y) with (x - y) mod 4 in {0,1} belongs to a horizontal brick, {2,3} to a vertical one
    for t in range(-n, n):
        for k in range(-n // 4 - 2, n // 4 + 2):
            hx, hy = 4 * k + t, t
            d.rectangle([hx * unit, hy * unit, (hx + 2) * unit, (hy + 1) * unit], outline=color, width=width)
            vx, vy = 4 * k + 2 + t, t - 1
            d.rectangle([vx * unit, vy * unit, (vx + 1) * unit, (vy + 2) * unit], outline=color, width=width)
    tile = tile.rotate(45, resample=Image.BICUBIC, expand=False)
    out = Image.new("RGBA", canvas, (0, 0, 0, 0))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    out.paste(tile, (cx - side // 2, cy - side // 2), tile)
    mask = Image.new("L", canvas, 0)
    ImageDraw.Draw(mask).rectangle(box, fill=255)
    clipped = Image.new("RGBA", canvas, (0, 0, 0, 0))
    clipped.paste(out, (0, 0), mask)
    ImageDraw.Draw(clipped).rectangle(box, outline=color, width=width)
    return clipped


def grout_image(pattern: str, color, box, canvas=(W, H)) -> Image.Image:
    tw, th, style = GROUT_PATTERNS[pattern]
    if style == "herringbone":
        return draw_herringbone(box, tw // 2, color, canvas)
    img = Image.new("RGBA", canvas, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if style == "grid":
        draw_grid(d, box, tw, th, color)
    elif style == "brick":
        draw_grid(d, box, tw, th, color, stagger=True)
    elif style == "brick-v":
        draw_grid(d, box, tw, th, color, stagger=True, vertical=True)
    elif style == "diamond":
        draw_diamond(d, box, tw, color)
    elif style == "hexagon":
        draw_hex(d, box, 18, color)
    return img


def grout_layer(pattern: str, color_id: str) -> Image.Image:
    color = GROUT_COLORS[color_id]
    img = grout_image(pattern, color, (AX0, AY0, AX1, AY1))
    d = ImageDraw.Draw(img)
    for x in (BX0, BX1):  # tiles restart at the corners
        d.line([(x, AY0), (x, AY1)], fill=color, width=3)
    return img


# ───────────────────────────── bases, fixtures, extras ─────────────────────────────
def base_layer(kind: str) -> Image.Image:
    layer = new_layer()
    white, shade, edge = (246, 246, 244), (222, 222, 219), (200, 200, 196)
    if kind == "bathtub":
        layer = soft_shadow(layer, (AX0, TUB_TOP + 20, AX1, AY1 + 10), 70, 14)
        d = ImageDraw.Draw(layer)
        for y in range(TUB_TOP + 26, AY1):
            d.line([(AX0, y), (AX1, y)], fill=lerp(white, shade, (y - TUB_TOP - 26) / (AY1 - TUB_TOP - 26)))
        d.rounded_rectangle([AX0, TUB_TOP, AX1, TUB_TOP + 30], radius=12, fill=(252, 252, 251))
        d.line([(AX0, TUB_TOP + 30), (AX1, TUB_TOP + 30)], fill=edge, width=2)
        d.ellipse([AX0 + 44, TUB_TOP - 10, AX1 - 44, TUB_TOP + 14], fill=(236, 238, 238))
    else:
        layer = soft_shadow(layer, (AX0, PAN_TOP + 6, AX1, AY1 + 10), 60, 12)
        d = ImageDraw.Draw(layer)
        for y in range(PAN_TOP + 12, AY1):
            d.line([(AX0, y), (AX1, y)], fill=lerp(white, shade, (y - PAN_TOP - 12) / (AY1 - PAN_TOP - 12)))
        d.rounded_rectangle([AX0, PAN_TOP, AX1, PAN_TOP + 18], radius=8, fill=(252, 252, 251))
        d.line([(AX0, PAN_TOP + 18), (AX1, PAN_TOP + 18)], fill=edge, width=2)
        d.ellipse([912, PAN_TOP + 40, 956, PAN_TOP + 54], fill=(214, 216, 216))  # drain
        if kind == "seated-shower":
            layer = soft_shadow(layer, (986, 790, AX1, PAN_TOP), 80, 12)
            d = ImageDraw.Draw(layer)
            d.rectangle([992, 812, AX1 - 4, PAN_TOP], fill=shade)
            d.rounded_rectangle([988, 792, AX1 - 2, 820], radius=8, fill=(252, 252, 251))
            d.line([(988, 820), (AX1 - 2, 820)], fill=edge, width=2)
    return layer


def fixtures_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    hx, hy = HEAD
    metal_disc(d, hx, hy - 50, 22, m)                          # escutcheon
    metal_bar(d, (hx - 8, hy - 50, hx + 8, hy + 8), m, vertical=True)
    metal_bar(d, (hx - 66, hy + 4, hx + 66, hy + 22), m)      # rain head
    d.ellipse([hx - 62, hy + 16, hx + 62, hy + 30], fill=hexrgb(m["lo"]))
    for x in range(hx - 52, hx + 52, 9):
        d.ellipse([x, hy + 22, x + 3, hy + 25], fill=hexrgb(m["hi"]))
    vx, vy = VALVE
    metal_disc(d, vx, vy, 46, m)
    d.ellipse([vx - 14, vy - 14, vx + 14, vy + 14], fill=hexrgb(m["lo"]))
    metal_bar(d, (vx - 5, vy + 8, vx + 5, vy + 76), m, vertical=True)
    metal_disc(d, vx, vy + 78, 9, m)
    return layer


def spout_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    vx = VALVE[0]
    metal_disc(d, vx, SPOUT_Y, 16, m)
    metal_bar(d, (vx - 14, SPOUT_Y - 10, vx + 14, SPOUT_Y + 10), m)
    metal_bar(d, (vx, SPOUT_Y - 8, vx + 54, SPOUT_Y + 10), m)
    metal_bar(d, (vx + 40, SPOUT_Y - 8, vx + 54, SPOUT_Y + 28), m, vertical=True)
    return layer


def door_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer, "RGBA")
    top, bottom = RAIL_Y1 + 6, PAN_TOP - 6
    for px0, px1 in PANELS:
        d.rectangle([px0, top, px1, bottom], fill=(255, 255, 255, 30))
        d.rectangle([px0, top, px1, bottom], outline=(230, 236, 240, 170), width=3)
        d.polygon([(px0 + 40, top), (px0 + 110, top), (px0 + 10, bottom), (px0, bottom - 60)], fill=(255, 255, 255, 46))
        d.polygon([(px1 - 120, top), (px1 - 90, top), (px1 - 160, bottom), (px1 - 190, bottom)], fill=(255, 255, 255, 22))
    metal_bar(d, (AX0, RAIL_Y0, AX1, RAIL_Y1), m)              # header rail
    for x in ROLLER_XS:
        metal_disc(d, x, (RAIL_Y0 + RAIL_Y1) // 2, 12, m)
    metal_bar(d, (AX0 + 8, PAN_TOP - 12, AX1 - 8, PAN_TOP - 2), m)  # bottom guide
    metal_bar(d, (AX0 + 30, BAR_Y, AX1 - 30, BAR_Y + 14), m)   # horizontal grip across both panels
    for x in (AX0 + 30, PANELS[0][1] - 10, AX1 - 44):
        metal_disc(d, x + 7, BAR_Y + 7, 10, m)
    return layer


def storage_layer(kind: str) -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer, "RGBA")
    white, edge = (250, 250, 248), (205, 205, 202)
    x0, x1 = 1040, AX1 - 8

    def shelf(y, glass=False):
        if glass:
            d.polygon([(x0, y), (x1, y), (x1, y + 8), (x0, y + 8)], fill=(210, 235, 240, 120))
            d.line([(x0, y), (x1, y)], fill=(255, 255, 255, 220), width=2)
            d.line([(x0, y + 8), (x1, y + 8)], fill=(150, 190, 200, 200), width=2)
        else:
            d.rectangle([x0, y, x1, y + 12], fill=white, outline=edge)
            d.rectangle([x0, y + 12, x1, y + 20], fill=(230, 230, 227))
        d.rounded_rectangle([x0 + 22, y - 54, x0 + 44, y - 2], radius=5, fill=(236, 240, 242))
        d.rectangle([x0 + 28, y - 62, x0 + 38, y - 52], fill=(220, 224, 226))

    if kind == "glass-shelf":
        shelf(440, glass=True)
    elif kind == "single-shelf":
        shelf(440)
    elif kind == "three-tier":
        for y in (330, 470, 610):
            shelf(y)
        d.rectangle([x1 - 8, 310, x1, 630], fill=(232, 232, 230))
    elif kind == "tower-caddy":
        d.rectangle([1062, 300, x1, PAN_TOP], fill=(244, 244, 242), outline=edge, width=2)
        for y in (420, 560, 700, 840):
            d.rectangle([1062, y, x1, y + 10], fill=(228, 228, 226))
            d.rounded_rectangle([1080, y - 52, 1102, y - 2], radius=5, fill=(236, 240, 242))
    return layer


def accent_layer() -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    y0, y1 = 420, 464
    d.rectangle([AX0, y0, AX1, y1], fill=(120, 124, 128))
    rng = random.Random(11)
    cols = [(232, 232, 230), (196, 200, 204), (168, 172, 176), (214, 204, 186), (150, 156, 162)]
    for x in range(AX0 + 3, AX1, 22):
        for y in (y0 + 3, y0 + 24):
            d.rectangle([x, y, x + 18, y + 17], fill=rng.choice(cols))
    return shade_returns(layer)


def window_layer() -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = 640, 160, 840, 320
    d.rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=(240, 240, 238))
    d.rectangle([x0, y0, x1, y1], fill=(226, 236, 240))
    for gx in range(x0, x1, 50):
        for gy in range(y0, y1, 40):
            d.rectangle([gx + 2, gy + 2, gx + 48, gy + 38], fill=(238, 246, 248), outline=(208, 222, 228))
            d.rectangle([gx + 8, gy + 8, gx + 24, gy + 16], fill=(250, 253, 254))
    return layer


def safety_layer(kind: str, finish: str | None = None) -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    if kind == "grab-bar":
        m = METALS[finish or "chrome"]
        metal_disc(d, 580, 706, 16, m)
        metal_disc(d, 900, 706, 16, m)
        metal_bar(d, (580, 698, 900, 714), m)
    elif kind == "safety-shelf":
        d.polygon([(BX1 - 2, 700), (AX1, 700), (AX1, 716), (BX1 - 2, 716)], fill=(250, 250, 248))
        d.polygon([(BX1 - 2, 716), (AX1, 716), (AX1, 726), (BX1 - 2, 726)], fill=(228, 228, 226))
        d.rectangle([BX1 - 2, 640, BX1 + 8, 726], fill=(232, 232, 230))
        d.rounded_rectangle([1084, 648, 1106, 698], radius=5, fill=(236, 240, 242))
    return layer


# ───────────────────────────── thumbnails ─────────────────────────────
def composite(*layers: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for l in layers:
        out = Image.alpha_composite(out, l.convert("RGBA"))
    return out


def thumb_from(scene: Image.Image, crop) -> Image.Image:
    return scene.crop(crop).resize(THUMB, Image.LANCZOS)


def pattern_thumb(fill_fn, pattern: str | None = None, grout="silver") -> Image.Image:
    img = fill_fn(THUMB)
    if pattern:
        img = Image.alpha_composite(img, grout_image(pattern, GROUT_COLORS[grout], (0, 0, THUMB[0], THUMB[1]), THUMB))
    return img


def main() -> None:
    print("rooms")
    source = load_room_source()
    rooms = {t: recolor_room(source, t) for t in ("blue", "green", "grey")}
    for t, img in rooms.items():
        save(img, f"rooms/{t}-room.jpg")
        save(img.resize(THUMB, Image.LANCZOS), f"thumbs/rooms/{t}.png")

    print("walls")
    size = (AX1 - AX0, AY1 - AY0)
    stone_layers, marble_layers = {}, {}
    for sid, color in STONES.items():
        stone_layers[sid] = wall_layer(stone_fill(size, color, seed=sum(map(ord, sid))))
        save(stone_layers[sid], f"walls/smooth/{sid}.png")
        save(stone_layers[sid], f"walls/tile/{sid}.png")
        save(pattern_thumb(lambda s, c=color: stone_fill(s, c)), f"thumbs/wall-styles/{sid}.png")
    for mid, spec in MARBLES.items():
        marble_layers[mid] = wall_layer(marble_fill(size, spec, seed=sum(map(ord, mid))))
        save(marble_layers[mid], f"walls/marble/{mid}.png")
        save(pattern_thumb(lambda s, sp=spec, m=mid: marble_fill(s, sp, seed=sum(map(ord, m)) + 1)), f"thumbs/wall-styles/{mid}.png")
    save(wall_layer(stone_fill(size, (247, 247, 245), speckle=0.02)), "walls/subway/white-tile.png")

    print("grout")
    for pattern in GROUT_PATTERNS:
        for cid in GROUT_COLORS:
            save(grout_layer(pattern, cid), f"walls/grout/{pattern}-{cid}.png")
    white_fill = lambda s: stone_fill(s, (247, 247, 245), speckle=0.02)  # noqa: E731
    for pattern in ("3x6", "3x6-vertical", "6x12", "6x12-vertical", "6x24", "12x24", "12x24-vertical", "trendz", "herringbone", "hexagon"):
        save(pattern_thumb(white_fill, pattern), f"thumbs/wall-styles/{pattern}.png")
    for cid in GROUT_COLORS:
        save(pattern_thumb(white_fill, "3x6", cid), f"thumbs/grout/{cid}.png")

    print("wall types")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["white"])), "thumbs/wall-types/smooth.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["sandstone"]), "12x12"), "thumbs/wall-types/tile-12x12.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["limestone"]), "11x20"), "thumbs/wall-types/tile-11x20.png")
    save(pattern_thumb(white_fill, "3x6"), "thumbs/wall-types/subway.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["white"], speckle=0.02)), "thumbs/wall-types/illusions-white.png")
    for mid, spec in MARBLES.items():
        save(pattern_thumb(lambda s, sp=spec: marble_fill(s, sp, seed=99)), f"thumbs/wall-types/illusions-{mid}.png")

    print("bases, fixtures, doors")
    bases = {k: base_layer(k) for k in ("shower", "bathtub", "seated-shower")}
    for k, img in bases.items():
        save(img, f"bathroom-types/{k}.png")
    fixtures = {f: fixtures_layer(f) for f in METALS}
    for f, img in fixtures.items():
        save(img, f"fixtures/{f}.png")
        save(spout_layer(f), f"fixtures/tub-spout-{f}.png")
        save(door_layer(f), f"doors/sliding-glass-{f}.png")
        save(safety_layer("grab-bar", f), f"safety/grab-bar-{f}.png")
    save(safety_layer("safety-shelf"), "safety/safety-shelf.png")
    save(window_layer(), "windows/acrylic-window.png")
    save(accent_layer(), "accents/decorative-accent.png")
    for k in ("glass-shelf", "single-shelf", "three-tier", "tower-caddy"):
        save(storage_layer(k), f"storage/{k}.png")

    print("scene thumbnails")
    room, wall = rooms["blue"], marble_layers["carrara"]
    scene = lambda *extra: composite(room, wall, *extra)  # noqa: E731
    for k, img in bases.items():
        extra = [img, fixtures["chrome"]] + ([spout_layer("chrome")] if k == "bathtub" else [])
        save(thumb_from(scene(*extra), (380, 560, 1220, 1190)), f"thumbs/bathroom-types/{k}.png")
    save(thumb_from(scene(bases["shower"], fixtures["chrome"]), (300, 40, 1300, 790)), "thumbs/doors/none.png")
    save(thumb_from(scene(bases["shower"], fixtures["chrome"], door_layer("chrome")), (300, 40, 1300, 790)), "thumbs/doors/sliding-glass.png")
    for f in METALS:
        save(thumb_from(scene(bases["shower"], fixtures[f]), (785, 20, 1185, 320)), f"thumbs/trim/{f}.png")
    base_scene = scene(bases["shower"], fixtures["chrome"])
    save(thumb_from(base_scene, (760, 240, 1240, 600)), "thumbs/storage/none.png")
    for k in ("glass-shelf", "single-shelf", "three-tier", "tower-caddy"):
        save(thumb_from(composite(base_scene, storage_layer(k)), (760, 240, 1240, 600)), f"thumbs/storage/{k}.png")
    save(thumb_from(base_scene, (400, 300, 1200, 900)), "thumbs/accent/none.png")
    save(thumb_from(composite(base_scene, accent_layer()), (400, 300, 1200, 900)), "thumbs/accent/accent.png")
    save(thumb_from(base_scene, (500, 60, 980, 420)), "thumbs/windows/none.png")
    save(thumb_from(composite(base_scene, window_layer()), (500, 60, 980, 420)), "thumbs/windows/acrylic-window.png")
    save(thumb_from(base_scene, (480, 560, 1200, 1100)), "thumbs/safety/none.png")
    save(thumb_from(composite(base_scene, safety_layer("grab-bar", "chrome")), (480, 560, 1200, 1100)), "thumbs/safety/grab-bar.png")
    save(thumb_from(composite(base_scene, safety_layer("safety-shelf")), (480, 560, 1200, 1100)), "thumbs/safety/safety-shelf.png")
    print("done")


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    main()
