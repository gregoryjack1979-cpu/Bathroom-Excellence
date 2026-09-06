#!/usr/bin/env python3
"""
Generates placeholder art for the Bathroom Design Builder.

Every preview layer is drawn on the same 1600x1200 canvas so the layers
composite correctly on top of one another. Real product photography should be
supplied at the same canvas size with transparency outside the product — drop
the file in at the same path and nothing else needs to change.

    python3 scripts/generate-builder-placeholders.py

Requires Pillow.
"""
from __future__ import annotations

import math
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "assets"

# ── shared canvas geometry (keep in sync with lib/builder/previewLayers.ts) ──
W, H = 1600, 1200
AX0, AX1 = 520, 1080  # alcove opening (left/right)
AY0, AY1 = 100, 1060  # alcove wall top / floor
BX0, BX1 = 640, 960   # back wall (between the two return walls)
FLOOR_Y = 1000        # room floor line
THUMB = (480, 360)

METALS = {
    "chrome":         {"hi": "#f4f6f8", "mid": "#c7ced4", "lo": "#7f8b95"},
    "matte-black":    {"hi": "#4a4a4a", "mid": "#2a2a2a", "lo": "#141414"},
    "brushed-nickel": {"hi": "#e8e3dc", "mid": "#bdb6ac", "lo": "#847c72"},
}

ROOMS = {
    "blue":  {"wall": (63, 109, 138),  "vanity": (52, 54, 58),   "top": (232, 233, 230)},
    "green": {"wall": (111, 125, 63),  "vanity": (246, 246, 244), "top": (60, 60, 62)},
    "grey":  {"wall": (139, 151, 160), "vanity": (198, 163, 118), "top": (240, 240, 238)},
}

STONES = {
    "white":       (243, 243, 240),
    "sandstone":   (216, 201, 168),
    "silverstone": (185, 190, 194),
    "limestone":   (207, 197, 176),
    "ridgestone":  (157, 154, 148),
}

MARBLES = {
    "venatino":         {"base": (246, 246, 244), "vein": (150, 156, 162), "warm": False, "bold": 0.6},
    "calcutta":         {"base": (248, 247, 244), "vein": (120, 126, 132), "warm": False, "bold": 1.0},
    "calcutta-vintage": {"base": (240, 234, 222), "vein": (150, 138, 118), "warm": True,  "bold": 0.9},
    "calcutta-gold":    {"base": (247, 245, 240), "vein": (178, 148, 92),  "warm": True,  "bold": 0.8},
    "carrara":          {"base": (236, 238, 238), "vein": (158, 164, 170), "warm": False, "bold": 0.5},
}

# grout pattern id -> (tile w, tile h, style)   sizes in px (≈5.3 px per inch)
GROUT_PATTERNS = {
    "12x12":          (64, 64, "grid"),
    "11x20":          (106, 58, "brick"),
    "3x6":            (32, 16, "brick"),
    "3x6-vertical":   (16, 32, "brick-v"),
    "6x12":           (64, 32, "brick"),
    "6x12-vertical":  (32, 64, "brick-v"),
    "6x24":           (128, 32, "brick"),
    "12x24":          (128, 64, "brick"),
    "12x24-vertical": (64, 128, "brick-v"),
    "trendz":         (44, 44, "diamond"),
    "herringbone":    (32, 16, "herringbone"),
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
        img.convert("RGB").save(path, "JPEG", quality=86, optimize=True, progressive=True)
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


# ───────────────────────────── rooms ─────────────────────────────
def draw_room(theme: str) -> Image.Image:
    spec = ROOMS[theme]
    wall = spec["wall"]
    img = Image.new("RGBA", (W, H), wall + (255,))
    d = ImageDraw.Draw(img)

    # soft ceiling light
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(14):
        a = int(50 * (1 - i / 14))
        gd.ellipse([-300 + i * 40, -700 + i * 40, W + 300 - i * 40, 500 - i * 40], fill=(255, 250, 235, a))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # alcove recess: bare, slightly darker, with return-wall shading
    recess = lerp(wall, (0, 0, 0), 0.12)
    d.rectangle([AX0, AY0, AX1, AY1], fill=recess)
    for i in range(BX0 - AX0):
        t = i / (BX0 - AX0)
        c = lerp(lerp(wall, (0, 0, 0), 0.34), recess, t)
        d.line([(AX0 + i, AY0), (AX0 + i, AY1)], fill=c)
        d.line([(AX1 - i, AY0), (AX1 - i, AY1)], fill=c)
    d.rectangle([AX0 - 14, AY0 - 14, AX1 + 14, AY0], fill=lerp(wall, (255, 255, 255), 0.25))  # header trim
    d.rectangle([AX0 - 14, AY0 - 14, AX0, AY1], fill=lerp(wall, (255, 255, 255), 0.18))
    d.rectangle([AX1, AY0 - 14, AX1 + 14, AY1], fill=lerp(wall, (255, 255, 255), 0.18))

    # floor: wood planks, darker toward the back
    for y in range(FLOOR_Y, H):
        t = (y - FLOOR_Y) / (H - FLOOR_Y)
        d.line([(0, y), (W, y)], fill=lerp((140, 100, 66), (178, 132, 88), t))
    rng = random.Random(7)
    for row, y in enumerate(range(FLOOR_Y, H, 48)):
        d.line([(0, y), (W, y)], fill=(112, 78, 50), width=2)
        off = (row * 230) % 400
        for x in range(-400 + off, W, 400):
            d.line([(x, y), (x, y + 48)], fill=(112, 78, 50), width=2)
        for _ in range(6):
            gx = rng.randint(0, W)
            d.line([(gx, y + 6), (gx + rng.randint(40, 120), y + 6)], fill=(150, 110, 74), width=1)
    # alcove floor sits behind the pan/tub — leave the recess floor flat
    d.rectangle([AX0, FLOOR_Y, AX1, AY1], fill=lerp(recess, (0, 0, 0), 0.1))
    # baseboard either side of the alcove
    d.rectangle([0, FLOOR_Y - 18, AX0 - 14, FLOOR_Y], fill=(246, 246, 243))
    d.rectangle([AX1 + 14, FLOOR_Y - 18, W, FLOOR_Y], fill=(246, 246, 243))

    # left: framed print + towel bar
    d.rectangle([150, 200, 420, 420], fill=(58, 58, 60))
    d.rectangle([166, 216, 404, 404], fill=(250, 250, 248))
    d.rectangle([196, 246, 374, 374], fill=(214, 220, 224))
    d.ellipse([250, 290, 320, 340], fill=(180, 190, 196))
    metal_bar(d, (150, 520, 400, 534), METALS["chrome"])
    d.rectangle([185, 534, 335, 700], fill=(250, 250, 250))
    d.rectangle([185, 534, 335, 560], fill=(236, 236, 236))

    # right: mirror, vanity, top, faucet
    d.rectangle([1180, 180, 1520, 520], fill=(176, 182, 188))
    d.rectangle([1196, 196, 1504, 504], fill=lerp(wall, (255, 255, 255), 0.55))
    d.rectangle([1160, 690, 1560, 720], fill=spec["top"])
    d.rectangle([1160, 720, 1560, FLOOR_Y - 18], fill=spec["vanity"])
    edge = lerp(spec["vanity"], (0, 0, 0), 0.35)
    d.rectangle([1160, 720, 1560, FLOOR_Y - 18], outline=edge, width=3)
    d.line([(1360, 720), (1360, FLOOR_Y - 18)], fill=edge, width=3)
    knob = lerp(spec["vanity"], (255, 255, 255), 0.5)
    d.ellipse([1340, 800, 1352, 812], fill=knob)
    d.ellipse([1368, 800, 1380, 812], fill=knob)
    d.ellipse([1300, 680, 1420, 700], fill=lerp(spec["top"], (0, 0, 0), 0.08))  # basin
    metal_bar(d, (1352, 610, 1368, 690), METALS["chrome"], vertical=True)
    metal_bar(d, (1340, 600, 1400, 614), METALS["chrome"])
    return img


# ───────────────────────────── walls ─────────────────────────────
def shade_returns(layer: Image.Image) -> Image.Image:
    """Darken the two return walls so the alcove reads as recessed."""
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    for i in range(BX0 - AX0):
        a = int(88 * (1 - i / (BX0 - AX0)))
        d.line([(AX0 + i, AY0), (AX0 + i, AY1)], fill=(0, 0, 0, a))
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
    for v in range(count):
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
        if rng.random() < 0.5:  # a fine tributary
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
        # columns of stacked tiles, alternate columns offset by half a tile
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


def draw_hex(d, box, r, color, width=2):
    x0, y0, x1, y1 = box
    dx, dy = math.sqrt(3) * r, 1.5 * r
    row = 0
    y = y0
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


def draw_herringbone(box, unit, color, width=2) -> Image.Image:
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
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    out.paste(tile, (cx - side // 2, cy - side // 2), tile)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).rectangle(box, fill=255)
    clipped = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    clipped.paste(out, (0, 0), mask)
    ImageDraw.Draw(clipped).rectangle(box, outline=color, width=width)
    return clipped


def grout_image(pattern: str, color, box, canvas=(W, H)) -> Image.Image:
    tw, th, style = GROUT_PATTERNS[pattern]
    if style == "herringbone":
        img = draw_herringbone(box, tw // 2, color) if canvas == (W, H) else None
        if img is None:  # thumbnail-sized canvas
            big = draw_herringbone((0, 0, box[2], box[3]), tw // 2, color)
            img = big.crop((0, 0, canvas[0], canvas[1]))
        return img
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
        draw_hex(d, box, 15, color)
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
    d = ImageDraw.Draw(layer)
    white, shade, edge = (246, 246, 244), (222, 222, 219), (200, 200, 196)
    if kind == "bathtub":
        layer = soft_shadow(layer, (AX0, 850, AX1, AY1 + 10), 70, 14)
        d = ImageDraw.Draw(layer)
        for y in range(862, AY1):
            d.line([(AX0, y), (AX1, y)], fill=lerp(white, shade, (y - 862) / (AY1 - 862)))
        d.rounded_rectangle([AX0, 836, AX1, 866], radius=12, fill=(252, 252, 251))
        d.line([(AX0, 866), (AX1, 866)], fill=edge, width=2)
        d.ellipse([AX0 + 40, 826, AX1 - 40, 850], fill=(236, 238, 238))  # rim / water line
    else:
        layer = soft_shadow(layer, (AX0, 998, AX1, AY1 + 10), 60, 12)
        d = ImageDraw.Draw(layer)
        for y in range(1004, AY1):
            d.line([(AX0, y), (AX1, y)], fill=lerp(white, shade, (y - 1004) / (AY1 - 1004)))
        d.rounded_rectangle([AX0, 992, AX1, 1010], radius=8, fill=(252, 252, 251))
        d.line([(AX0, 1010), (AX1, 1010)], fill=edge, width=2)
        d.ellipse([780, 1030, 820, 1042], fill=(214, 216, 216))  # drain
        if kind == "seated-shower":
            layer = soft_shadow(layer, (895, 800, AX1, 1000), 80, 12)
            d = ImageDraw.Draw(layer)
            d.rectangle([900, 810, AX1 - 4, 1000], fill=shade)
            d.rounded_rectangle([896, 790, AX1 - 2, 818], radius=8, fill=(252, 252, 251))
            d.line([(896, 818), (AX1 - 2, 818)], fill=edge, width=2)
    return layer


def fixtures_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    # shower arm + rain head
    metal_disc(d, 800, 190, 22, m)
    metal_bar(d, (792, 190, 808, 262), m, vertical=True)
    metal_bar(d, (738, 258, 862, 276), m)
    d.ellipse([742, 270, 858, 284], fill=hexrgb(m["lo"]))
    for x in range(752, 850, 9):
        d.ellipse([x, 276, x + 3, 279], fill=hexrgb(m["hi"]))
    # valve plate + lever
    metal_disc(d, 800, 640, 44, m)
    d.ellipse([786, 626, 814, 654], fill=hexrgb(m["lo"]))
    metal_bar(d, (795, 648, 805, 712), m, vertical=True)
    metal_disc(d, 800, 714, 9, m)
    return layer


def spout_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    metal_disc(d, 800, 790, 16, m)
    metal_bar(d, (786, 780, 814, 800), m)
    metal_bar(d, (800, 782, 852, 800), m)
    metal_bar(d, (838, 782, 852, 818), m, vertical=True)
    return layer


def door_layer(finish: str) -> Image.Image:
    m = METALS[finish]
    layer = new_layer()
    d = ImageDraw.Draw(layer, "RGBA")
    top, bottom = 132, 992
    panels = [(AX0 + 8, 812), (788, AX1 - 8)]
    for i, (px0, px1) in enumerate(panels):
        d.rectangle([px0, top, px1, bottom], fill=(255, 255, 255, 30))
        d.rectangle([px0, top, px1, bottom], outline=(230, 236, 240, 170), width=3)
        # diagonal specular sweep
        d.polygon([(px0 + 40, top), (px0 + 110, top), (px0 + 10, bottom), (px0, bottom - 60)], fill=(255, 255, 255, 46))
        d.polygon([(px1 - 120, top), (px1 - 90, top), (px1 - 160, bottom), (px1 - 190, bottom)], fill=(255, 255, 255, 22))
    # header rail + rollers, bottom guide, handle
    metal_bar(d, (AX0, 116, AX1, 138), m)
    for x in (600, 770, 830, 1000):
        metal_disc(d, x, 127, 11, m)
    metal_bar(d, (AX0 + 8, 988, AX1 - 8, 998), m)
    metal_bar(d, (838, 470, 854, 690), m, vertical=True)
    metal_bar(d, (826, 470, 856, 482), m)
    metal_bar(d, (826, 678, 856, 690), m)
    return layer


def storage_layer(kind: str) -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer, "RGBA")
    white, edge = (250, 250, 248), (205, 205, 202)

    def shelf(y, glass=False, x0=956, x1=1076):
        if glass:
            d.polygon([(x0, y), (x1, y), (x1, y + 8), (x0, y + 8)], fill=(210, 235, 240, 120))
            d.line([(x0, y), (x1, y)], fill=(255, 255, 255, 220), width=2)
            d.line([(x0, y + 8), (x1, y + 8)], fill=(150, 190, 200, 200), width=2)
        else:
            d.rectangle([x0, y, x1, y + 12], fill=white, outline=edge)
            d.rectangle([x0, y + 12, x1, y + 20], fill=(230, 230, 227))
        # a bottle so the shelf reads at a glance
        d.rounded_rectangle([x0 + 24, y - 54, x0 + 46, y - 2], radius=5, fill=(236, 240, 242))
        d.rectangle([x0 + 30, y - 62, x0 + 40, y - 52], fill=(220, 224, 226))

    if kind == "glass-shelf":
        shelf(520, glass=True)
    elif kind == "single-shelf":
        shelf(520)
    elif kind == "three-tier":
        for y in (400, 540, 680):
            shelf(y)
        d.rectangle([1068, 380, 1076, 700], fill=(232, 232, 230))
    elif kind == "tower-caddy":
        d.rectangle([992, 300, 1076, 1000], fill=(244, 244, 242), outline=edge)
        d.rectangle([992, 300, 1076, 1000], outline=edge, width=2)
        for y in (420, 560, 700, 840):
            d.rectangle([992, y, 1076, y + 10], fill=(228, 228, 226))
            d.rounded_rectangle([1010, y - 52, 1032, y - 2], radius=5, fill=(236, 240, 242))
    return layer


def accent_layer() -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    y0, y1 = 436, 480
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
    x0, y0, x1, y1 = 712, 176, 888, 336
    d.rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=(240, 240, 238))
    d.rectangle([x0, y0, x1, y1], fill=(226, 236, 240))
    for gx in range(x0, x1, 44):
        for gy in range(y0, y1, 40):
            d.rectangle([gx + 2, gy + 2, gx + 42, gy + 38], fill=(238, 246, 248), outline=(208, 222, 228))
            d.rectangle([gx + 8, gy + 8, gx + 22, gy + 16], fill=(250, 253, 254))
    return layer


def safety_layer(kind: str, finish: str | None = None) -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    if kind == "grab-bar":
        m = METALS[finish or "chrome"]
        metal_disc(d, 672, 766, 16, m)
        metal_disc(d, 928, 766, 16, m)
        metal_bar(d, (672, 758, 928, 774), m)
    elif kind == "safety-shelf":
        d.polygon([(BX1 - 2, 700), (AX1, 700), (AX1, 716), (BX1 - 2, 716)], fill=(250, 250, 248))
        d.polygon([(BX1 - 2, 716), (AX1, 716), (AX1, 726), (BX1 - 2, 726)], fill=(228, 228, 226))
        d.rectangle([BX1 - 2, 640, BX1 + 8, 726], fill=(232, 232, 230))
        d.rounded_rectangle([1000, 648, 1022, 698], radius=5, fill=(236, 240, 242))
    return layer


# ───────────────────────────── thumbnails ─────────────────────────────
def composite(*layers: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for l in layers:
        out = Image.alpha_composite(out, l)
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
    rooms = {t: draw_room(t) for t in ROOMS}
    for t, img in rooms.items():
        save(img, f"rooms/{t}-room.jpg")
        save(thumb_from(img, (200, 150, 1400, 1050)), f"thumbs/rooms/{t}.png")

    print("walls")
    stone_layers, marble_layers = {}, {}
    for sid, color in STONES.items():
        fill = stone_fill((AX1 - AX0, AY1 - AY0), color, seed=sum(map(ord, sid)))
        stone_layers[sid] = wall_layer(fill)
        save(stone_layers[sid], f"walls/smooth/{sid}.png")
        save(stone_layers[sid], f"walls/tile/{sid}.png")
        save(pattern_thumb(lambda s, c=color: stone_fill(s, c)), f"thumbs/wall-styles/{sid}.png")
    for mid, spec in MARBLES.items():
        fill = marble_fill((AX1 - AX0, AY1 - AY0), spec, seed=sum(map(ord, mid)))
        marble_layers[mid] = wall_layer(fill)
        save(marble_layers[mid], f"walls/marble/{mid}.png")
        save(pattern_thumb(lambda s, sp=spec, m=mid: marble_fill(s, sp, seed=sum(map(ord, m)) + 1)), f"thumbs/wall-styles/{mid}.png")
    subway_base = wall_layer(stone_fill((AX1 - AX0, AY1 - AY0), (247, 247, 245), speckle=0.02))
    save(subway_base, "walls/subway/white-tile.png")

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
    room, wall = rooms["grey"], marble_layers["carrara"]
    scene = lambda *extra: composite(room, wall, *extra)  # noqa: E731
    for k, img in bases.items():
        save(thumb_from(scene(img, fixtures["chrome"], spout_layer("chrome") if k == "bathtub" else new_layer()), (380, 380, 1220, 1010)), f"thumbs/bathroom-types/{k}.png")
    save(thumb_from(scene(bases["shower"], fixtures["chrome"]), (380, 300, 1220, 930)), "thumbs/doors/none.png")
    save(thumb_from(scene(bases["shower"], fixtures["chrome"], door_layer("chrome")), (380, 300, 1220, 930)), "thumbs/doors/sliding-glass.png")
    for f in METALS:
        save(thumb_from(scene(bases["shower"], fixtures[f]), (600, 120, 1000, 420)), f"thumbs/trim/{f}.png")
    base_scene = scene(bases["shower"], fixtures["chrome"])
    save(thumb_from(base_scene, (640, 260, 1120, 620)), "thumbs/storage/none.png")
    for k in ("glass-shelf", "single-shelf", "three-tier", "tower-caddy"):
        save(thumb_from(composite(base_scene, storage_layer(k)), (640, 260, 1120, 620)), f"thumbs/storage/{k}.png")
    save(thumb_from(base_scene, (480, 300, 1120, 780)), "thumbs/accent/none.png")
    save(thumb_from(composite(base_scene, accent_layer()), (480, 300, 1120, 780)), "thumbs/accent/accent.png")
    save(thumb_from(base_scene, (560, 120, 1040, 480)), "thumbs/windows/none.png")
    save(thumb_from(composite(base_scene, window_layer()), (560, 120, 1040, 480)), "thumbs/windows/acrylic-window.png")
    save(thumb_from(base_scene, (560, 560, 1120, 980)), "thumbs/safety/none.png")
    save(thumb_from(composite(base_scene, safety_layer("grab-bar", "chrome")), (560, 560, 1120, 980)), "thumbs/safety/grab-bar.png")
    save(thumb_from(composite(base_scene, safety_layer("safety-shelf")), (560, 560, 1120, 980)), "thumbs/safety/safety-shelf.png")
    print("done")


if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    main()
