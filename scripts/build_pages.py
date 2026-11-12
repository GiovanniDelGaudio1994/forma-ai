#!/usr/bin/env python3
"""Publish the portfolio at the site root while preserving every public demo.

GitHub Pages previously served the FORMA AI showcase at / and the personal
portfolio at /portfolio/. This build makes the portfolio the landing page and
moves only the *published copy* of the FORMA AI showcase to /forma-ai-demo/.
The repository source remains unchanged and is still published with the
existing GitHub Actions workflow. No private application source is included.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit

SOURCE = Path(__file__).resolve().parents[1]
OUTPUT = SOURCE / "_site"
DOMAIN = "https://giovannidelgaudio.it/"
OLD_BASE = "https://giovannidelgaudio1994.github.io/forma-ai/"

PUBLIC_DIRS = (
    "assets",
    "portfolio",
    "ewine-demo",
    "fit-zone-demo",
    "gestione-farmacia-demo",
    "meteo-bash2d-demo",
    "signalscope-demo",
    "legacybridge-demo",
)
PUBLIC_FILES = (".nojekyll", "atlante-3d.html", "privacy.html")


def adapt_portfolio(html: str, root: bool) -> str:
    """Rewrite relative URLs for an index at / or /portfolio/."""
    folder = "" if root else "../"
    path_to_assets = "portfolio/" if root else ""
    if root:
        # The source markup lives in /portfolio/, but the generated copy is at /.
        for attr in ("src", "href"):
            html = html.replace(f'{attr}="assets/', f'{attr}="{path_to_assets}assets/')
        html = html.replace('data-demo-url="demos/', 'data-demo-url="portfolio/demos/')
        html = html.replace('data-demo-url="../', 'data-demo-url="')
    else:
        html = html.replace('href="sitemap.xml"', 'href="../sitemap.xml"')

    for name in ("fit-zone-demo", "signalscope-demo", "meteo-bash2d-demo",
                 "gestione-farmacia-demo", "ewine-demo", "legacybridge-demo"):
        html = html.replace(OLD_BASE + name + "/", folder + name + "/")

    # Preserve the main FORMA AI demo on its new dedicated URL.
    html = html.replace(OLD_BASE + "portfolio/", DOMAIN)
    html = html.replace(OLD_BASE, folder + "forma-ai-demo/")

    # Search engines should index the new site homepage, not duplicate paths.
    return html


def adapt_forma(html: str) -> str:
    html = html.replace('href="assets/', 'href="../assets/')
    html = html.replace('src="assets/', 'src="../assets/')
    html = html.replace('"atlante-3d.html"', '"../atlante-3d.html"')
    html = html.replace('"privacy.html"', '"../privacy.html"')
    return html


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        for key, value in attrs:
            if key in ("src", "href", "data-demo-url") and value:
                self.references.append(value)


def verify_local_references(page: Path) -> None:
    parser = References()
    parser.feed(page.read_text(encoding="utf-8"))
    missing = []
    for value in parser.references:
        parsed = urlsplit(value)
        if (parsed.scheme or parsed.netloc or not parsed.path
                or value.startswith(("#", "/", "mailto:", "javascript:"))):
            continue
        # Only local file references are validated; external websites are separate.
        target = (page.parent / unquote(parsed.path)).resolve()
        try:
            target.relative_to(OUTPUT.resolve())
        except ValueError:
            raise ValueError(f"Unsafe relative link in {page.name}: {value}") from None
        if not target.exists():
            missing.append(value)
    if missing:
        raise ValueError(f"Missing assets in {page}: {sorted(set(missing))}")


def build() -> None:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for name in PUBLIC_DIRS:
        source = SOURCE / name
        if not source.is_dir():
            raise FileNotFoundError(f"Missing public folder: {source}")
        shutil.copytree(source, OUTPUT / name)
    for name in PUBLIC_FILES:
        src = SOURCE / name
        if src.is_file():
            shutil.copy2(src, OUTPUT / name)

    template = (SOURCE / "portfolio/index.html").read_text(encoding="utf-8")
    (OUTPUT / "index.html").write_text(adapt_portfolio(template, root=True), encoding="utf-8")
    (OUTPUT / "portfolio/index.html").write_text(
        adapt_portfolio(template, root=False), encoding="utf-8"
    )

    forma = (SOURCE / "index.html").read_text(encoding="utf-8")
    (OUTPUT / "forma-ai-demo").mkdir(exist_ok=True)
    (OUTPUT / "forma-ai-demo/index.html").write_text(adapt_forma(forma), encoding="utf-8")

    # Both existing top-level demo utilities still belong to FORMA AI.
    for name in ("atlante-3d.html", "privacy.html"):
        page = OUTPUT / name
        if page.is_file():
            content = page.read_text(encoding="utf-8")
            if name == "atlante-3d.html":
                content = content.replace('href="./"', 'href="./forma-ai-demo/"')
            else:
                content = content.replace('href="index.html"', 'href="forma-ai-demo/"')
            page.write_text(content, encoding="utf-8")

    # A single canonical sitemap covers the homepage and the public demos.
    from xml.sax.saxutils import escape
    paths = ("", "forma-ai-demo/", "ewine-demo/", "fit-zone-demo/",
             "gestione-farmacia-demo/", "meteo-bash2d-demo/",
             "signalscope-demo/", "legacybridge-demo/", "atlante-3d.html")
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for path in paths:
        sitemap += f"  <url><loc>{escape(DOMAIN + path)}</loc></url>\n"
    sitemap += "</urlset>\n"
    (OUTPUT / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (OUTPUT / "portfolio/sitemap.xml").write_text(sitemap, encoding="utf-8")
    (OUTPUT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: " + DOMAIN + "sitemap.xml\n",
        encoding="utf-8",
    )

    for page in (
        OUTPUT / "index.html",
        OUTPUT / "portfolio/index.html",
        OUTPUT / "forma-ai-demo/index.html",
        OUTPUT / "legacybridge-demo/index.html",
    ):
        verify_local_references(page)

    assert (OUTPUT / "ewine-demo/index.html").exists()
    assert (OUTPUT / "fit-zone-demo/index.html").exists()
    assert (OUTPUT / "gestione-farmacia-demo/index.html").exists()
    assert (OUTPUT / "signalscope-demo/index.html").exists()
    assert (OUTPUT / "meteo-bash2d-demo/index.html").exists()
    assert (OUTPUT / "legacybridge-demo/index.html").exists()
    print("Site prepared: / = portfolio; /forma-ai-demo/ = FORMA AI; other demos preserved.")


if __name__ == "__main__":
    build()
