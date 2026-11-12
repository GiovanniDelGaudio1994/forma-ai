#!/usr/bin/env python3
"""Audit the two published portfolio pages; demos are tested separately.

This is a static regression guard, not a penetration test or a security guarantee.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
REQUIRED_CSP = (
    "default-src 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-attr 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src 'self'",
    "upgrade-insecure-requests",
)
CANONICAL = "https://giovannidelgaudio.it/"


class PortfolioAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.errors: list[str] = []
        self.csp = ""
        self.canonical = ""
        self.js_sources: set[str] = set()
        self.css_sources: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if any(key.startswith("on") for key in data):
            self.errors.append(f"Inline event handler on <{tag}>")
        if "style" in data:
            self.errors.append(f"Inline CSS attribute on <{tag}>")
        if tag == "style":
            self.errors.append("Inline <style> block")
        if tag == "script":
            src = data.get("src")
            if src:
                self.js_sources.add(src)
                if "://" in src or not src.endswith(("/site.js", "/theme-init.js")):
                    self.errors.append(f"Unapproved script source: {src}")
            elif data.get("type") != "application/ld+json":
                self.errors.append("Executable inline <script>")
        if tag == "meta" and (data.get("http-equiv") or "").lower() == "content-security-policy":
            self.csp = data.get("content") or ""
        if tag == "link" and data.get("rel") == "canonical":
            self.canonical = data.get("href") or ""
        if tag == "link" and data.get("rel") == "stylesheet":
            href = data.get("href") or ""
            self.css_sources.add(href)
            if "://" in href or not href.endswith("/site.css"):
                self.errors.append(f"Unapproved stylesheet: {href}")
        if tag == "a" and data.get("target") == "_blank":
            rel = set((data.get("rel") or "").split())
            if not {"noopener", "noreferrer"} <= rel:
                self.errors.append("target=_blank missing noopener/noreferrer")
        if tag in {"iframe", "object", "embed"} and tag != "iframe":
            self.errors.append(f"Embedded <{tag}> is not allowed")


def main() -> int:
    errors: list[str] = []
    for path in (SITE / "index.html", SITE / "portfolio/index.html"):
        if not path.is_file():
            errors.append(f"Missing generated page: {path}")
            continue
        page = PortfolioAudit()
        page.feed(path.read_text(encoding="utf-8"))
        errors.extend(f"{path}: {msg}" for msg in page.errors)
        for directive in REQUIRED_CSP:
            if directive not in page.csp:
                errors.append(f"{path}: missing CSP directive {directive}")
        if "'unsafe-inline'" in page.csp or "'unsafe-eval'" in page.csp:
            errors.append(f"{path}: unsafe-inline or unsafe-eval in CSP")
        if page.canonical != CANONICAL:
            errors.append(f"{path}: canonical must be {CANONICAL}")
        if len(page.js_sources) != 2 or len(page.css_sources) != 1:
            errors.append(f"{path}: first-party JS/CSS assets missing")
        for asset in page.js_sources | page.css_sources:
            target = path.parent / asset
            if not target.is_file():
                errors.append(f"{path}: missing referenced asset {asset}")
    for error in errors:
        print("SECURITY AUDIT FAILED:", error, file=sys.stderr)
    if errors:
        return 1
    print("Portfolio security regression checks passed (not a full security audit).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
