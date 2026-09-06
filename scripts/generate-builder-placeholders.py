#!/usr/bin/env python3
"""
Generates the art for the Bathroom Design Builder — from one photograph.

Source: a supplier render of the blue room (scripts/source/room-blue.png)
showing a shower with smooth white walls, a sliding glass door and chrome
hardware. Everything the builder shows is derived from it so that every
layer keeps the photograph's lighting and perspective:

  rooms/            the render with the door hardware, shower head and valve
                    inpainted away — a clean, open shower. Green and grey are
                    hue-shifted copies.
  doors/, fixtures/ the real rail, rollers, handle, head and valve cut out of
                    the render, recoloured for matte black and brushed nickel
  walls/            textures multiplied onto the render's wall luminance, so
                    shading and reflections survive
  bathroom-types/,  white acrylic forms (tub apron, seat, shelves, caddy)
  storage/, safety/ built from the render's own shower-pan pixels
  windows/, accents/ synthesised onto the wall's lighting
  thumbs/           option-card pictures composited from the above

All layers share one 1600x1200 canvas. Real product photography replaces any
file at the same path.

    python3 scripts/generate-builder-placeholders.py      (needs Pillow)
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / "public" / "assets"
SOURCE_ROOM = HERE / "source" / "room-blue.png"

# ── canvas geometry, measured off the render at canvas scale ─────────────────
W, H = 1600, 1200
AX0, AX1 = 440, 1150   # shower alcove (white wall) left / right
AY0 = 0                # the alcove runs off the top of the frame
PAN_TOP = 1000         # top face of the shower pan
AY1 = 1105             # bottom of the pan front
TUB_TOP = 850
CORNERS = (452, 1132)  # subtle return-wall corners (grout lines restart here)
THUMB = (480, 360)

# the render's hardware, in canvas pixels
RAIL_TOP = ((440, 64), (1150, 148))        # slanted header rail: top edge, left→right
RAIL_H = 44
ROLLERS = [(470, 93, 22), (795, 124, 22)]  # cx, cy, r
ENDCAP = (1102, 146, 1150, 198)
HANDLE = (462, 590, 1102, 620)
HANDLE_BRACKETS = [(478, 605, 15), (800, 605, 15), (1088, 601, 15)]
BOTTOM_TRACK = (455, 1076, 1140, 1100)
BOTTOM_BRACKET = (784, 1074, 808, 1098)
GLASS_EDGES = [(774, 60, 812, 1076), (1124, 150, 1148, 1076)]
HEAD = (936, 104, 1048, 172)
VALVE = (998, 522, 1082, 600)
SPOUT = (1040, 790)
TOWEL_BAR_SRC = (98, 486, 402, 522)        # a real chrome bar on the left wall → grab bar

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
GROUT_PATTERNS = {   # id -> (tile w, tile h, style) in canvas px (≈6.7 px per inch)
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
GROUT_COLORS = {"black": (34, 34, 36, 215), "silver": (176, 182, 188, 200)}
FINISHES = ("chrome", "matte-black", "brushed-nickel")


# ───────────────────────────── helpers ─────────────────────────────
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def new_layer() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def save(img: Image.Image, rel: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if rel.endswith(".jpg"):
        img.convert("RGB").save(path, "JPEG", quality=90, optimize=True, progressive=True)
    else:
        img.save(path, "PNG", optimize=True)
    print(f"  {rel}")


def rail_y(x: float) -> float:
    (x0, y0), (x1, y1) = RAIL_TOP
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def hardware_mask(feather=1.2) -> Image.Image:
    """Everything chrome on the door: rail, rollers, end cap, handle, bottom bracket."""
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.polygon([(440, rail_y(440)), (1150, rail_y(1150)), (1150, rail_y(1150) + RAIL_H), (440, rail_y(440) + RAIL_H)], fill=255)
    for cx, cy, r in ROLLERS + HANDLE_BRACKETS:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    d.rectangle(ENDCAP, fill=255)
    d.rectangle(HANDLE, fill=255)
    d.rectangle(BOTTOM_BRACKET, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))


def glass_mask(feather=1.0) -> Image.Image:
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for box in GLASS_EDGES:
        d.rectangle(box, fill=255)
    d.rectangle(BOTTOM_TRACK, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))


def fixtures_mask(feather=1.2) -> Image.Image:
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.rectangle(HEAD, fill=255)
    d.rectangle(VALVE, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))


# ───────────────────────────── inpainting ─────────────────────────────
def inpaint_rows(px, box, pad=7):
    """Rebuild a region by interpolating each row between clean pixels either side."""
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        l = [px[x, y] for x in range(x0 - pad, x0)]
        r = [px[x, y] for x in range(x1, x1 + pad)]
        lp = tuple(sum(c[i] for c in l) // len(l) for i in range(3))
        rp = tuple(sum(c[i] for c in r) // len(r) for i in range(3))
        n = x1 - x0
        for x in range(x0, x1):
            px[x, y] = lerp(lp, rp, (x - x0) / n)


def inpaint_cols(px, x0, x1, ytop, ybot, pad=7):
    """Same, column-wise, with per-column top/bottom edges (handles the slanted rail)."""
    for x in range(x0, x1):
        y0, y1 = int(ytop(x)), int(ybot(x))
        t = [px[x, y] for y in range(y0 - pad, y0)]
        b = [px[x, y] for y in range(y1, y1 + pad)]
        tp = tuple(sum(c[i] for c in t) // len(t) for i in range(3))
        bp = tuple(sum(c[i] for c in b) // len(b) for i in range(3))
        n = y1 - y0
        for y in range(y0, y1):
            px[x, y] = lerp(tp, bp, (y - y0) / n)


def clean_room(photo: Image.Image) -> Image.Image:
    """The render with door, head and valve removed — a clean open shower."""
    img = photo.copy()
    px = img.load()
    inpaint_cols(px, 436, 1152, lambda x: rail_y(x) - 6, lambda x: rail_y(x) + RAIL_H + 6)
    inpaint_cols(px, HANDLE[0] - 4, HANDLE[2] + 4, lambda x: HANDLE[1] - 6, lambda x: HANDLE[3] + 6)
    inpaint_cols(px, BOTTOM_TRACK[0], BOTTOM_TRACK[2], lambda x: BOTTOM_TRACK[1], lambda x: BOTTOM_TRACK[3])
    for x0, y0, x1, y1 in GLASS_EDGES:
        inpaint_rows(px, (x0, y0, x1, y1))
    inpaint_rows(px, HEAD)
    inpaint_rows(px, VALVE)
    # soften the seams of everything we touched
    touched = ImageChops.lighter(ImageChops.lighter(hardware_mask(0), glass_mask(0)), fixtures_mask(0))
    touched = touched.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2))
    return Image.composite(img.filter(ImageFilter.GaussianBlur(1.4)), img, touched)


def cutout(photo: Image.Image, clean: Image.Image, mask: Image.Image, keyed: bool) -> Image.Image:
    """Photo pixels inside `mask`.

    keyed=False: the mask *is* the shape (rail, rollers, handle — drawn exactly),
    so alpha is simply the mask. Bright chrome highlights stay solid, which
    matters once the layer is recoloured black.
    keyed=True: the mask is only a bounding box (head, valve, glass edges), so
    alpha comes from how much each pixel differs from the clean wall, with a
    closing pass so highlights inside the object don't become holes.
    """
    if not keyed:
        alpha = mask
    else:
        diff = ImageChops.difference(photo, clean).convert("L")
        alpha = Image.eval(diff, lambda v: 255 if v > 22 else (0 if v < 7 else int((v - 7) * 255 / 15)))
        alpha = alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
        alpha = ImageChops.multiply(alpha.filter(ImageFilter.GaussianBlur(0.6)), mask)
    out = photo.copy().convert("RGBA")
    out.putalpha(alpha)
    return out


# ───────────────────────────── finishes ─────────────────────────────
def recolor_metal(layer: Image.Image, finish: str) -> Image.Image:
    if finish == "chrome":
        return layer
    r, g, b, a = layer.split()
    lum = layer.convert("L")
    if finish == "matte-black":
        f = lambda v: int(v * 0.22 + 8)  # noqa: E731
        out = Image.merge("RGB", (lum.point(f), lum.point(f), lum.point(f)))
    else:  # brushed nickel — warm, slightly softer
        lum = lum.filter(ImageFilter.GaussianBlur(0.6))
        out = Image.merge("RGB", (
            lum.point(lambda v: min(255, int(v * 0.90 + 18))),
            lum.point(lambda v: min(255, int(v * 0.88 + 17))),
            lum.point(lambda v: min(255, int(v * 0.85 + 15))),
        ))
    out = out.convert("RGBA")
    out.putalpha(a)
    return out


def metal_bar(draw, box, finish, vertical=False):
    pal = {"chrome": ("#f4f6f8", "#c7ced4", "#7f8b95"), "matte-black": ("#4a4a4a", "#2a2a2a", "#141414"),
           "brushed-nickel": ("#e8e3dc", "#bdb6ac", "#847c72")}[finish]
    hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))  # noqa: E731
    hi, mid, lo = map(hexrgb, pal)
    x0, y0, x1, y1 = box
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


# ───────────────────────────── rooms ─────────────────────────────
def load_photo() -> Image.Image:
    src = Image.open(SOURCE_ROOM).convert("RGB")
    w, h = src.size
    return src.crop((0, 0, min(int(h * 4 / 3), w), h)).resize((W, H), Image.LANCZOS)


def recolor_room(img: Image.Image, mode: str) -> Image.Image:
    """Shift the blue wall paint to green or grey; everything else keeps its colour."""
    if mode == "blue":
        return img
    h, s, v = img.convert("HSV").split()
    mask = ImageChops.multiply(
        Image.eval(h, lambda x: 255 if 122 <= x <= 168 else 0),
        Image.eval(s, lambda x: 255 if x >= 55 else 0),
    ).filter(ImageFilter.GaussianBlur(1.2))
    if mode == "green":
        h2, s2, v2 = Image.eval(h, lambda x: (x - 92) % 256), Image.eval(s, lambda x: int(x * 0.8)), Image.eval(v, lambda x: min(255, int(x * 1.02)))
    else:
        h2, s2, v2 = h, Image.eval(s, lambda x: int(x * 0.16)), Image.eval(v, lambda x: min(255, int(x * 1.16) + 8))
    return Image.composite(Image.merge("HSV", (h2, s2, v2)).convert("RGB"), img, mask)


# ───────────────────────────── walls ─────────────────────────────
def stone_fill(size, color, seed=1, speckle=0.05):
    w, h = size
    img = Image.new("RGBA", (w, h), color + (255,))
    noise = Image.effect_noise((w, h), 26).convert("L")
    grain = Image.composite(img, Image.new("RGBA", (w, h), lerp(color, (0, 0, 0), 0.25) + (255,)), noise)
    return Image.blend(img, grain, speckle)


def marble_fill(size, spec, seed=3):
    w, h = size
    base = stone_fill((w, h), spec["base"], seed, speckle=0.03)
    veins = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(veins)
    rng = random.Random(seed)
    for _ in range(int(10 * spec["bold"]) + 4):
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
            branch = [(px_ + rng.uniform(-30, 30), py_ + rng.uniform(-10, 30)) for px_, py_ in pts[rng.randint(3, len(pts) - 3):]]
            d.line(branch, fill=spec["vein"] + (alpha // 2,), width=1, joint="curve")
    return Image.alpha_composite(base, veins.filter(ImageFilter.GaussianBlur(1.1)))


def lit(texture: Image.Image, clean: Image.Image, box, ref=236) -> Image.Image:
    """Multiply a texture by the render's own wall luminance inside `box`."""
    x0, y0, x1, y1 = box
    lum = clean.crop(box).convert("L")
    shade = lum.point(lambda v: min(255, int(v * 255 / ref)))
    tex = texture.convert("RGB").resize((x1 - x0, y1 - y0))
    out = ImageChops.multiply(tex, Image.merge("RGB", (shade, shade, shade)))
    layer = new_layer()
    layer.paste(out.convert("RGBA"), (x0, y0))
    return layer


def wall_layer(fill_img: Image.Image, clean: Image.Image) -> Image.Image:
    return lit(fill_img, clean, (AX0, AY0, AX1, PAN_TOP))


# ───────────────────────────── grout patterns ─────────────────────────────
def draw_grid(d, box, tw, th, color, stagger=False, vertical=False, width=2):
    x0, y0, x1, y1 = box
    if vertical:
        for col, x in enumerate(range(x0, x1, tw)):
            d.line([(x, y0), (x, y1)], fill=color, width=width)
            off = th // 2 if (stagger and col % 2) else 0
            for y in range(y0 - th + off, y1 + th, th):
                d.line([(x, y), (min(x + tw, x1), y)], fill=color, width=width)
    else:
        for row, y in enumerate(range(y0, y1, th)):
            d.line([(x0, y), (x1, y)], fill=color, width=width)
            off = tw // 2 if (stagger and row % 2) else 0
            for x in range(x0 - tw + off, x1 + tw, tw):
                d.line([(x, y), (x, min(y + th, y1))], fill=color, width=width)
    d.rectangle(box, outline=color, width=width)


def draw_hex(d, box, r, color):
    x0, y0, x1, y1 = box
    dx, dy = math.sqrt(3) * r, 1.5 * r
    row, y = 0, y0
    while y < y1 + r:
        x = x0 + (dx / 2 if row % 2 else 0)
        while x < x1 + dx:
            pts = [(x + r * math.cos(math.radians(60 * k - 30)), y + r * math.sin(math.radians(60 * k - 30))) for k in range(6)]
            d.polygon([(min(max(px_, x0), x1), min(max(py_, y0), y1)) for px_, py_ in pts], outline=color)
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
    x0, y0, x1, y1 = box
    side = int(math.hypot(x1 - x0, y1 - y0)) + 4 * unit
    tile = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    n = side // unit + 4
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


def grout_image(pattern, color, box, canvas=(W, H)) -> Image.Image:
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


def grout_layer(pattern, color_id) -> Image.Image:
    color = GROUT_COLORS[color_id]
    img = grout_image(pattern, color, (AX0, AY0, AX1, PAN_TOP))
    d = ImageDraw.Draw(img)
    for x in CORNERS:
        d.line([(x, AY0), (x, PAN_TOP)], fill=color, width=3)
    return img


# ───────────────────────────── acrylic forms from the pan ─────────────────────────────
def pan_top(clean: Image.Image, x0, x1) -> Image.Image:
    return clean.crop((x0, PAN_TOP - 2, x1, PAN_TOP + 22))


def pan_face(clean: Image.Image, x0, x1) -> Image.Image:
    return clean.crop((x0, PAN_TOP + 28, x1, PAN_TOP + 92))


def acrylic_block(clean, box, shadow=True) -> Image.Image:
    """A white acrylic slab whose top edge and face come from the real pan."""
    x0, y0, x1, y1 = box
    layer = new_layer()
    if shadow:
        sh = new_layer()
        ImageDraw.Draw(sh).rectangle([x0 - 6, y0 + 10, x1 + 8, y1 + 12], fill=(0, 0, 0, 80))
        layer = Image.alpha_composite(layer, sh.filter(ImageFilter.GaussianBlur(10)))
    top = pan_top(clean, x0, x1)
    face = pan_face(clean, x0, x1).resize((x1 - x0, max(1, y1 - y0 - top.height)), Image.LANCZOS)
    layer.paste(top.convert("RGBA"), (x0, y0))
    layer.paste(face.convert("RGBA"), (x0, y0 + top.height))
    return layer


def acrylic_form(clean: Image.Image, box, top_h=24) -> Image.Image:
    """A larger moulded acrylic shape (tub apron, seat): smooth generated
    surfaces, lit left-to-right the way the render's pan front is lit."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    # horizontal lighting profile from the pan's front lip
    lip = clean.crop((x0, AY1 - 12, x1, AY1 - 4)).convert("L").resize((w, 1))
    ref = max(1, max(lip.getdata()))
    profile = lip.point(lambda v: min(255, int(255 * (0.86 + 0.14 * v / ref))))
    shade = profile.resize((w, h))
    face = Image.new("RGB", (w, h))
    fp = face.load()
    for y in range(h):
        if y < top_h:
            c = lerp((252, 252, 251), (240, 241, 240), y / top_h)
        else:
            t = (y - top_h) / max(1, h - top_h)
            c = lerp((247, 247, 246), (222, 223, 222), t)
        for x in range(w):
            fp[x, y] = c
    face = ImageChops.multiply(face, Image.merge("RGB", (shade, shade, shade)))
    layer = new_layer()
    sh = new_layer()
    ImageDraw.Draw(sh).rectangle([x0 - 8, y0 + 12, x1 + 10, y1 + 12], fill=(0, 0, 0, 85))
    layer = Image.alpha_composite(layer, sh.filter(ImageFilter.GaussianBlur(12)))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=10, fill=255)
    rgba = face.convert("RGBA")
    rgba.putalpha(mask)
    layer.alpha_composite(rgba, (x0, y0))
    d = ImageDraw.Draw(layer, "RGBA")
    d.line([(x0 + 6, y0 + top_h), (x1 - 6, y0 + top_h)], fill=(200, 202, 202, 160), width=2)  # top edge
    return layer


def base_layer(kind: str, clean: Image.Image) -> Image.Image | None:
    if kind == "shower":
        return None  # the pan is part of the room
    if kind == "bathtub":
        return acrylic_form(clean, (AX0, TUB_TOP, AX1, AY1 + 2), top_h=30)
    # seated shower: pan stays, add a moulded seat in the right corner
    return acrylic_form(clean, (990, 830, AX1 - 6, PAN_TOP + 2), top_h=22)


def storage_layer(kind: str, clean: Image.Image) -> Image.Image:
    layer = new_layer()
    x0, x1 = 1040, AX1 - 8

    def shelf(y, glass=False):
        nonlocal layer
        if glass:
            d = ImageDraw.Draw(layer, "RGBA")
            d.polygon([(x0, y), (x1, y), (x1, y + 9), (x0, y + 9)], fill=(215, 236, 240, 130))
            d.line([(x0, y), (x1, y)], fill=(255, 255, 255, 230), width=2)
            d.line([(x0, y + 9), (x1, y + 9)], fill=(140, 180, 190, 210), width=2)
        else:
            layer = Image.alpha_composite(layer, acrylic_block(clean, (x0, y, x1, y + 26), shadow=True))
        d = ImageDraw.Draw(layer, "RGBA")
        d.rounded_rectangle([x0 + 22, y - 56, x0 + 46, y - 2], radius=6, fill=(238, 242, 244, 235))
        d.rectangle([x0 + 29, y - 64, x0 + 39, y - 54], fill=(214, 220, 224, 235))

    if kind == "glass-shelf":
        shelf(450, glass=True)
    elif kind == "single-shelf":
        shelf(450)
    elif kind == "three-tier":
        for y in (340, 480, 620):
            shelf(y)
        layer = Image.alpha_composite(layer, acrylic_block(clean, (x1 - 10, 320, x1, 650), shadow=False))
    elif kind == "tower-caddy":
        layer = acrylic_block(clean, (1062, 300, x1, PAN_TOP + 2))
        for y in (430, 570, 710, 850):
            layer = Image.alpha_composite(layer, acrylic_block(clean, (1058, y, x1 + 2, y + 22), shadow=False))
            ImageDraw.Draw(layer, "RGBA").rounded_rectangle([1080, y - 54, 1104, y - 2], radius=6, fill=(238, 242, 244, 235))
    return layer


def safety_shelf_layer(clean: Image.Image) -> Image.Image:
    layer = acrylic_block(clean, (CORNERS[1] - 4, 700, AX1 - 6, 726))
    layer = Image.alpha_composite(layer, acrylic_block(clean, (CORNERS[1] - 4, 640, CORNERS[1] + 8, 728), shadow=False))
    ImageDraw.Draw(layer, "RGBA").rounded_rectangle([1086, 646, 1110, 698], radius=6, fill=(238, 242, 244, 235))
    return layer


def grab_bar_layer(photo: Image.Image, finish: str) -> Image.Image:
    """The render's real chrome towel bar, keyed off the blue wall and moved into the shower."""
    x0, y0, x1, y1 = TOWEL_BAR_SRC
    crop = photo.crop((x0, y0, x1, y1)).convert("RGB")
    # the chrome reflects the blue wall, so key by shape and neutralise the tint
    lum = crop.convert("L")
    bar = Image.merge("RGB", (lum, lum, lum)).convert("RGBA")
    mask = Image.new("L", crop.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([20, 8, crop.width - 20, 27], radius=9, fill=255)
    for cx in (20, crop.width - 20):
        d.ellipse([cx - 13, 5, cx + 13, 31], fill=255)
    bar.putalpha(mask.filter(ImageFilter.GaussianBlur(0.8)))
    bar = bar.resize((360, int(crop.height * 360 / crop.width)), Image.LANCZOS)
    layer = new_layer()
    layer.alpha_composite(recolor_metal(bar, finish), (560, 690))
    return layer


def spout_layer(finish: str) -> Image.Image:
    layer = new_layer()
    d = ImageDraw.Draw(layer)
    x, y = SPOUT
    metal_bar(d, (x - 16, y - 12, x + 16, y + 12), finish)
    metal_bar(d, (x, y - 9, x + 58, y + 9), finish)
    metal_bar(d, (x + 44, y - 9, x + 58, y + 30), finish, vertical=True)
    return layer


def accent_layer(clean: Image.Image) -> Image.Image:
    y0, y1 = 430, 474
    tex = Image.new("RGB", (AX1 - AX0, y1 - y0), (110, 114, 118))
    d = ImageDraw.Draw(tex)
    rng = random.Random(11)
    cols = [(232, 232, 230), (196, 200, 204), (168, 172, 176), (214, 204, 186), (150, 156, 162)]
    for x in range(3, tex.width, 22):
        for y in (3, 24):
            d.rectangle([x, y, x + 18, y + 17], fill=rng.choice(cols))
    return lit(tex, clean, (AX0, y0, AX1, y1))


def window_layer(clean: Image.Image) -> Image.Image:
    x0, y0, x1, y1 = 700, 150, 900, 310
    tex = Image.new("RGB", (x1 - x0, y1 - y0), (226, 236, 242))
    d = ImageDraw.Draw(tex)
    for gx in range(0, tex.width, 50):
        for gy in range(0, tex.height, 40):
            d.rectangle([gx + 2, gy + 2, gx + 48, gy + 38], fill=(238, 246, 250), outline=(205, 220, 228))
            d.rectangle([gx + 8, gy + 8, gx + 24, gy + 16], fill=(252, 254, 255))
    layer = new_layer()
    ImageDraw.Draw(layer).rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=(244, 244, 242, 255))
    return Image.alpha_composite(layer, lit(tex, clean, (x0, y0, x1, y1), ref=225))


# ───────────────────────────── thumbnails ─────────────────────────────
def composite(*layers) -> Image.Image:
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for l in layers:
        if l is not None:
            out = Image.alpha_composite(out, l.convert("RGBA"))
    return out


def thumb_from(scene, crop) -> Image.Image:
    return scene.crop(crop).resize(THUMB, Image.LANCZOS)


def pattern_thumb(fill_fn, pattern=None, grout="silver") -> Image.Image:
    img = fill_fn(THUMB)
    if pattern:
        img = Image.alpha_composite(img, grout_image(pattern, GROUT_COLORS[grout], (0, 0, THUMB[0], THUMB[1]), THUMB))
    return img


def main() -> None:
    print("photo → clean room + cut-outs")
    photo = load_photo()
    clean = clean_room(photo)
    door_hw = cutout(photo, clean, hardware_mask(), keyed=False)
    door_glass = cutout(photo, clean, glass_mask(), keyed=True)
    fixtures = cutout(photo, clean, fixtures_mask(), keyed=True)

    print("rooms")
    rooms = {t: recolor_room(clean, t) for t in ("blue", "green", "grey")}
    for t, img in rooms.items():
        save(img, f"rooms/{t}-room.jpg")

    print("doors / fixtures / safety hardware")
    doors, fixt = {}, {}
    for f in FINISHES:
        doors[f] = composite(door_glass, recolor_metal(door_hw, f))
        fixt[f] = recolor_metal(fixtures, f)
        save(doors[f], f"doors/sliding-glass-{f}.png")
        save(fixt[f], f"fixtures/{f}.png")
        save(spout_layer(f), f"fixtures/tub-spout-{f}.png")
        save(grab_bar_layer(photo, f), f"safety/grab-bar-{f}.png")
    save(safety_shelf_layer(clean), "safety/safety-shelf.png")

    print("walls")
    size = (AX1 - AX0, PAN_TOP - AY0)
    walls = {}
    for sid, color in STONES.items():
        walls[sid] = wall_layer(stone_fill(size, color, seed=sum(map(ord, sid))), clean)
        save(walls[sid], f"walls/smooth/{sid}.png")
        save(walls[sid], f"walls/tile/{sid}.png")
        save(pattern_thumb(lambda s, c=color: stone_fill(s, c)), f"thumbs/wall-styles/{sid}.png")
    for mid, spec in MARBLES.items():
        walls[mid] = wall_layer(marble_fill(size, spec, seed=sum(map(ord, mid))), clean)
        save(walls[mid], f"walls/marble/{mid}.png")
        save(pattern_thumb(lambda s, sp=spec, m=mid: marble_fill(s, sp, seed=sum(map(ord, m)) + 1)), f"thumbs/wall-styles/{mid}.png")
    save(wall_layer(stone_fill(size, (247, 247, 245), speckle=0.02), clean), "walls/subway/white-tile.png")

    print("grout")
    for pattern in GROUT_PATTERNS:
        for cid in GROUT_COLORS:
            save(grout_layer(pattern, cid), f"walls/grout/{pattern}-{cid}.png")
    white_fill = lambda s: stone_fill(s, (247, 247, 245), speckle=0.02)  # noqa: E731
    for pattern in ("3x6", "3x6-vertical", "6x12", "6x12-vertical", "6x24", "12x24", "12x24-vertical", "trendz", "herringbone", "hexagon"):
        save(pattern_thumb(white_fill, pattern), f"thumbs/wall-styles/{pattern}.png")
    for cid in GROUT_COLORS:
        save(pattern_thumb(white_fill, "3x6", cid), f"thumbs/grout/{cid}.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["white"])), "thumbs/wall-types/smooth.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["sandstone"]), "12x12"), "thumbs/wall-types/tile-12x12.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["limestone"]), "11x20"), "thumbs/wall-types/tile-11x20.png")
    save(pattern_thumb(white_fill, "3x6"), "thumbs/wall-types/subway.png")
    save(pattern_thumb(lambda s: stone_fill(s, STONES["white"], speckle=0.02)), "thumbs/wall-types/illusions-white.png")
    for mid, spec in MARBLES.items():
        save(pattern_thumb(lambda s, sp=spec: marble_fill(s, sp, seed=99)), f"thumbs/wall-types/illusions-{mid}.png")

    print("bases, storage, window, accent")
    bases = {k: base_layer(k, clean) for k in ("shower", "bathtub", "seated-shower")}
    for k, img in bases.items():
        if img is not None:
            save(img, f"bathroom-types/{k}.png")
    storage = {k: storage_layer(k, clean) for k in ("glass-shelf", "single-shelf", "three-tier", "tower-caddy")}
    for k, img in storage.items():
        save(img, f"storage/{k}.png")
    window, accent = window_layer(clean), accent_layer(clean)
    save(window, "windows/acrylic-window.png")
    save(accent, "accents/decorative-accent.png")

    print("scene thumbnails")
    room = rooms["blue"]
    start = composite(room, fixt["chrome"], doors["chrome"])  # the starting design = the render
    for t, img in rooms.items():
        save(composite(img, fixt["chrome"], doors["chrome"]).resize(THUMB, Image.LANCZOS), f"thumbs/rooms/{t}.png")
    for k in bases:
        scene = composite(room, walls["carrara"], bases[k], fixt["chrome"], spout_layer("chrome") if k == "bathtub" else None)
        save(thumb_from(scene, (300, 560, 1300, 1310 - 110)), f"thumbs/bathroom-types/{k}.png")
    save(thumb_from(composite(room, fixt["chrome"]), (300, 40, 1300, 790)), "thumbs/doors/none.png")
    save(thumb_from(start, (300, 40, 1300, 790)), "thumbs/doors/sliding-glass.png")
    for f in FINISHES:
        save(thumb_from(composite(room, fixt[f], doors[f]), (860, 40, 1180, 280)), f"thumbs/trim/{f}.png")
    open_shower = composite(room, fixt["chrome"])
    save(thumb_from(open_shower, (760, 250, 1240, 610)), "thumbs/storage/none.png")
    for k, img in storage.items():
        save(thumb_from(composite(open_shower, img), (760, 250, 1240, 610)), f"thumbs/storage/{k}.png")
    save(thumb_from(open_shower, (400, 250, 1200, 850)), "thumbs/accent/none.png")
    save(thumb_from(composite(open_shower, accent), (400, 250, 1200, 850)), "thumbs/accent/accent.png")
    save(thumb_from(open_shower, (560, 60, 1040, 420)), "thumbs/windows/none.png")
    save(thumb_from(composite(open_shower, window), (560, 60, 1040, 420)), "thumbs/windows/acrylic-window.png")
    save(thumb_from(open_shower, (480, 560, 1200, 1100)), "thumbs/safety/none.png")
    save(thumb_from(composite(open_shower, grab_bar_layer(photo, "chrome")), (480, 560, 1200, 1100)), "thumbs/safety/grab-bar.png")
    save(thumb_from(composite(open_shower, safety_shelf_layer(clean)), (480, 560, 1200, 1100)), "thumbs/safety/safety-shelf.png")
    print("done")


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    main()
