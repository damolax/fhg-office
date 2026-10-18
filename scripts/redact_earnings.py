"""Permanently anonymize published FHG team-result screenshots.

Keeps the earning/order UI sharp; heavily pixelates chat names, photos and
other context outside the proof card. Redacts client names inside kept cards.
The originals should never be deployed after this script is run.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets" / "team-results"
# Coordinates are relative to 420px-wide source previews.
# Only the earning/order proof panel in each picture remains legible.
KEEP = {
    "172356.jpg": [(43, 36, 338, 155)],
    "172344.jpg": [(121, 20, 335, 117)],
    "172332.jpg": [(16, 0, 296, 391)],
    "172342.jpg": [(15, 44, 318, 287)],
    "172343.jpg": [(144, 50, 373, 159)],
    "172322.jpg": [(16, 11, 406, 137)],
    "172320.jpg": [(29, 34, 366, 225)],
    "172307.jpg": [(17, 45, 287, 389)],
    "172306.jpg": [(18, 96, 285, 220)],
    "172278.jpg": [(44, 46, 337, 135)],
}
# PII inside a proof panel: payer's name and buyer's username.
REDACT = {
    "172356.jpg": [(114, 92, 333, 130)],
    "172306.jpg": [(35, 151, 245, 185)],
}

def scale_rect(rect, scale, width, height):
    l, t, r, b = rect
    return (
        max(0, min(width, round(l * scale))),
        max(0, min(height, round(t * scale))),
        max(0, min(width, round(r * scale))),
        max(0, min(height, round(b * scale))),
    )

def anonymize(name, panels):
    file = BASE / name
    if not file.is_file():
        raise FileNotFoundError(file)
    with Image.open(file) as source:
        image = source.convert("RGB")
    w, h = image.size
    scale = w / 420
    # Destroy legibility outside the evidence areas before encoding to JPEG.
    low = image.resize((max(1, w // 35), max(1, h // 35)), Image.Resampling.BOX)
    background = low.resize((w, h), Image.Resampling.NEAREST).filter(
        ImageFilter.GaussianBlur(max(3, round(6 * scale)))
    )
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    for coords in panels:
        mask_draw.rectangle(scale_rect(coords, scale, w, h), fill=255)
    output = Image.composite(image, background, mask)
    # Solid, irreversible blocks for any identifiers within a kept panel.
    painter = ImageDraw.Draw(output)
    for coords in REDACT.get(name, []):
        painter.rounded_rectangle(
            scale_rect(coords, scale, w, h),
            radius=max(2, round(5 * scale)),
            fill=(19, 29, 27),
        )
    output.save(file, format="JPEG", quality=90, optimize=True, subsampling=0)
    print(f"Anonymized {file.relative_to(ROOT)} ({w}x{h})")

if __name__ == "__main__":
    for name, panels in KEEP.items():
        anonymize(name, panels)
