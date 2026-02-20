#!/usr/bin/env python3
"""
Generate Open Graph card images dynamically.
Creates macOS-style window containers matching the website's design.
"""

import argparse
import os
import sys
from pathlib import Path

# Add project root for imports if needed
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)


# Website color palette (from src/css/base.css)
COLORS = {
    "bg_primary": "#0d0d0d",
    "bg_secondary": "#1a1a1a",
    "bg_tertiary": "#242424",
    "text_primary": "#e6e6e6",
    "text_secondary": "#b0b0b0",
    "text_muted": "#707070",
    "accent_primary": "#60a5fa",
    "border_subtle": "#2a2a2a",
    "traffic_red": "#ef4444",
    "traffic_yellow": "#eab308",
    "traffic_green": "#22c55e",
}


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Load Roboto Mono, Source Code Pro, or system monospace, fallback to default."""
    font_paths = [
        "/System/Library/Fonts/Supplemental/RobotoMono-Regular.ttf",
        "/System/Library/Fonts/Supplemental/SourceCodePro-Regular.ttf",
        "/System/Library/Fonts/Supplemental/PTMono.ttc",
        "/System/Library/Fonts/Supplemental/Andale Mono.ttf",
        "/System/Library/Fonts/Monaco.ttf",
        "/usr/share/fonts/truetype/roboto/RobotoMono-Regular.ttf",
        "/usr/share/fonts/truetype/source-code-pro/SourceCodePro-Regular.ttf",
        str(PROJECT_ROOT / "src" / "fonts" / "RobotoMono-Regular.ttf"),
        str(PROJECT_ROOT / "src" / "fonts" / "SourceCodePro-Regular.ttf"),
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float, float, float],
    radius: int,
    fill: str | tuple,
    outline: str | tuple | None = None,
) -> None:
    """Draw a rounded rectangle (Pillow 8.2+ has rounded_rectangle)."""
    if hasattr(draw, "rounded_rectangle"):
        draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline)
    else:
        # Fallback: draw regular rectangle
        draw.rectangle(xy, fill=fill, outline=outline)




def generate_og_image(
    text: str = "Ethan\nGutierrez",
    output_path: str | Path | None = None,
    width: int = 1200,
    height: int = 630,
) -> Path:
    """
    Generate an Open Graph card image with macOS-style window.

    Args:
        text: Text to display in the window (use \\n for line breaks)
        output_path: Where to save the image. Default: project_root/og-image.png
        width: Image width (OG recommended: 1200)
        height: Image height (OG recommended: 630)

    Returns:
        Path to the saved image
    """
    if output_path is None:
        output_path = PROJECT_ROOT / "og-image.png"
    output_path = Path(output_path)

    # Scale factors for proportional layout
    scale = min(width, height) / 630
    radius = int(16 * scale)
    padding = int(48 * scale)
    header_height = int(56 * scale)
    traffic_size = int(12 * scale)
    traffic_gap = int(8 * scale)
    traffic_left = int(24 * scale)
    content_padding = int(32 * scale)

    # Window dimensions (centered)
    window_width = int(520 * scale)
    window_height = int(280 * scale)
    window_x = (width - window_width) // 2
    window_y = (height - window_height) // 2

    # Create image with bg_primary
    img = Image.new("RGB", (width, height), hex_to_rgb(COLORS["bg_primary"]))
    draw = ImageDraw.Draw(img)

    # Draw window shadow (offset darker area behind window)
    shadow_offset = int(12 * scale)
    shadow_color = (20, 20, 20)  # Slightly darker than bg_primary
    shadow_rect = (
        window_x + shadow_offset,
        window_y + shadow_offset,
        window_x + window_width + shadow_offset,
        window_y + window_height + shadow_offset,
    )
    draw_rounded_rect(draw, shadow_rect, radius + 6, fill=shadow_color)

    # Draw window background (bg_secondary)
    window_rect = (window_x, window_y, window_x + window_width, window_y + window_height)
    draw_rounded_rect(
        draw,
        window_rect,
        radius,
        fill=hex_to_rgb(COLORS["bg_secondary"]),
        outline=hex_to_rgb(COLORS["border_subtle"]),
    )

    # Draw header (gradient from bg_secondary to bg_tertiary)
    header_rect = (
        window_x,
        window_y,
        window_x + window_width,
        window_y + header_height,
    )
    for i in range(header_height):
        t = i / max(header_height - 1, 1)
        r = int(26 + (36 - 26) * t)
        g = int(26 + (36 - 26) * t)
        b = int(26 + (36 - 26) * t)
        draw.rectangle(
            [
                window_x,
                window_y + i,
                window_x + window_width,
                window_y + i + 1,
            ],
            fill=(r, g, b),
        )

    # Header bottom border
    draw.line(
        [
            (window_x, window_y + header_height),
            (window_x + window_width, window_y + header_height),
        ],
        fill=hex_to_rgb(COLORS["border_subtle"]),
        width=1,
    )

    # Traffic lights
    traffic_y = window_y + (header_height - traffic_size) // 2
    for i, color in enumerate(
        [COLORS["traffic_red"], COLORS["traffic_yellow"], COLORS["traffic_green"]]
    ):
        tx = window_x + traffic_left + i * (traffic_size + traffic_gap)
        draw.ellipse(
            [tx, traffic_y, tx + traffic_size, traffic_y + traffic_size],
            fill=hex_to_rgb(color),
        )

    # Content area - centered text
    content_y = window_y + header_height + content_padding
    content_height = window_height - header_height - content_padding * 2

    # Font size scales with window
    font_size = int(36 * scale)
    font = load_font(font_size)

    lines = text.split("\n")
    line_height = int(font_size * 1.4)
    total_text_height = len(lines) * line_height
    start_y = content_y + (content_height - total_text_height) // 2

    for i, line in enumerate(lines):
        # Get text bbox for centering
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = window_x + (window_width - text_width) // 2
        text_y = start_y + i * line_height

        draw.text(
            (text_x, text_y),
            line,
            font=font,
            fill=hex_to_rgb(COLORS["text_secondary"]),
        )

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate Open Graph card images with macOS-style windows"
    )
    parser.add_argument(
        "-t",
        "--text",
        default="Ethan\nGutierrez",
        help="Text to display (use \\n for line breaks). Default: Ethan\\nGutierrez",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Output path. Default: og-image.png in project root",
    )
    parser.add_argument(
        "-w",
        "--width",
        type=int,
        default=1200,
        help="Image width (default: 1200 for OG)",
    )
    parser.add_argument(
        "-H",
        "--height",
        type=int,
        default=630,
        help="Image height (default: 630 for OG)",
    )
    args = parser.parse_args()

    output = generate_og_image(
        text=args.text.replace("\\n", "\n"),
        output_path=args.output,
        width=args.width,
        height=args.height,
    )
    print(f"Generated: {output}")


if __name__ == "__main__":
    main()
