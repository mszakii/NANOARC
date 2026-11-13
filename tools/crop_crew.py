"""Crop the Qamar Square crew sprites out of the two character sheets.

Run from anywhere:  python -I tools/crop_crew.py
Needs Pillow. Writes ten WebP files to public/assets/crew/.

How it works: each sprite is cropped with a generous box, the cream paper is
flood-filled from every border pixel (with a tolerance), the filled colour
becomes alpha 0, and only the blob that contains the crop centre is kept
(that drops neighbouring poses, ground shadows and printed labels).
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "crew"

SHEETS = {
    "girl": ROOT / "c670afee-f388-49ef-8e62-ea675492cb3a.png",
    "boy": ROOT / "b36c70fb-e3bc-4734-b085-def05d529271.png",
}

# (left, top, right, bottom) on the 1536x1024 sheets. Boxes stop above the printed labels.
BODY_BOX = (496, 40, 742, 556)
BODY_HELMET = (618, 148, 93)  # sheet x, y, radius of the white dome on the FRONT pose
BODY_SHADOW_Y = 500  # below this sheet row the painted ground shadow is treated as paper
PORTRAIT_BOXES = {
    "happy": (16, 626, 284, 908),
    "surprised": (286, 626, 537, 908),
    "worried": (539, 626, 790, 908),
    "determined": (791, 626, 1046, 908),
}
# Helmet dome (sheet x per mood, shared y and radius), measured from the outline.
# It is refilled after keying because the white shell leaks into the cream paper.
PORTRAIT_CX = {"happy": 148, "surprised": 411, "worried": 664, "determined": 913}
PORTRAIT_CY, PORTRAIT_R = 751, 113

SENTINEL = (255, 0, 255)
PAPER_THRESH = 30  # flood-fill tolerance (sum of channel differences vs the seed pixel)
PAPER_MIN = 205  # a border pixel only seeds a fill if it is this light


def key_paper(crop, thresh=PAPER_THRESH, shadow_from=None):
    """Return an L mask: 255 = keep, 0 = paper reachable from the crop border.

    Rows at or below `shadow_from` get their warm mid-tones (the painted ground
    shadow) flattened to the paper colour first, so the fill runs through the
    shadow and stops at the dark boot outline and the cool grey soles.
    """
    work = crop.convert("RGB")
    px = work.load()
    w, h = work.size
    if shadow_from is not None:
        paper = px[1, 1]
        for y in range(shadow_from, h):
            for x in range(w):
                r, g, b = px[x, y]
                if min(r, g, b) >= 120 and r > b + 12 and r >= g:
                    px[x, y] = paper
    border = [(x, y) for x in range(0, w, 2) for y in (0, h - 1)]
    border += [(x, y) for y in range(0, h, 2) for x in (0, w - 1)]
    for xy in border:
        r, g, b = px[xy]
        if (r, g, b) == SENTINEL:
            continue
        if min(r, g, b) >= PAPER_MIN and r >= b:  # light and warm: paper, not ink
            ImageDraw.floodfill(work, xy, SENTINEL, thresh=thresh)
    diff = ImageChops.difference(work, Image.new("RGB", work.size, SENTINEL)).convert("L")
    return diff.point(lambda v: 255 if v else 0)


def centre_blob(mask, seed):
    """Keep only the connected opaque region that contains `seed`."""
    m = mask.copy()
    if m.getpixel(seed) == 0:
        return mask
    ImageDraw.floodfill(m, seed, 128, thresh=0)
    return m.point(lambda v: 255 if v == 128 else 0)


def soften(mask):
    """Pull the edge in by a pixel and feather it so no cream halo is left."""
    tight = mask.filter(ImageFilter.MinFilter(3))
    soft = tight.filter(ImageFilter.GaussianBlur(0.8))
    return ImageChops.darker(soft, mask)


def cut(sheet, box, seed_rel=(0.5, 0.5), dome=None, shadow_y=None):
    crop = sheet.crop(box)
    mask = key_paper(crop, shadow_from=None if shadow_y is None else shadow_y - box[1])
    if dome:
        cx, cy, r = dome[0] - box[0], dome[1] - box[1], dome[2]
        ImageDraw.Draw(mask).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    seed = (int(crop.width * seed_rel[0]), int(crop.height * seed_rel[1]))
    mask = soften(centre_blob(mask, seed))
    out = crop.convert("RGBA")
    out.putalpha(mask)
    return out.crop(mask.getbbox())


def fit_square(img, size):
    side = max(img.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def save(img, name):
    path = OUT / name
    img.save(path, "WEBP", quality=80, method=6)
    return path.stat().st_size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for who, src in SHEETS.items():
        sheet = Image.open(src).convert("RGB")
        for mood, box in PORTRAIT_BOXES.items():
            dome = (PORTRAIT_CX[mood], PORTRAIT_CY, PORTRAIT_R)
            total += save(fit_square(cut(sheet, box, dome=dome), 256), f"{who}-{mood}.webp")
        body = cut(sheet, BODY_BOX, seed_rel=(0.5, 0.45), dome=BODY_HELMET, shadow_y=BODY_SHADOW_Y)
        height = 320
        width = round(body.width * height / body.height)
        total += save(body.resize((width, height), Image.Resampling.LANCZOS), f"{who}-body.webp")
    print(f"wrote 10 files to {OUT} ({total / 1024:.0f} KB total)")


if __name__ == "__main__":
    main()
