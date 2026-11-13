#!/usr/bin/env python3
"""Build accessible, localized release notes from an audited JSON history.

To publish a change, append one verified entry in project_updates.json.
No JavaScript/network access is required to read notes; JS only filters them.
"""
from __future__ import annotations

from datetime import date
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/project_updates.json"
PLACEHOLDER = '<div class="release-feed" data-release-feed></div>'
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

LABELS = {
    "it": {
        "all": "Tutti i progetti",
        "feature": "Novità",
        "fix": "Correzione",
        "documentation": "Documentazione",
        "release": "Rilascio",
        "read_more": "Apri il progetto",
        "filter_label": "Filtra gli aggiornamenti per progetto",
        "date": ("gen", "feb", "mar", "apr", "mag", "giu",
                 "lug", "ago", "set", "ott", "nov", "dic"),
    },
    "en": {
        "all": "All projects",
        "feature": "Feature",
        "fix": "Fix",
        "documentation": "Documentation",
        "release": "Release",
        "read_more": "Explore project",
        "filter_label": "Filter release notes by project",
        "date": ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
    },
}


def generate_feed(lang: str) -> str:
    if lang not in LABELS:
        raise ValueError(f"Unsupported release-note language: {lang}")

    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1:
        raise ValueError("Unsupported changelog schema version")
    records = data.get("entries")
    if not isinstance(records, list) or not records:
        raise ValueError("Changelog requires at least one release note")

    def check(entry: dict) -> date:
        slug = entry.get("project", "")
        if not SLUG.fullmatch(slug):
            raise ValueError(f"Invalid project slug: {slug!r}")
        when = date.fromisoformat(entry["date"])
        if when > date.today():
            raise ValueError(f"Future release not allowed: {when}")
        if entry.get("type") not in {"feature", "fix", "documentation", "release"}:
            raise ValueError("Unknown release type")
        if not str(entry.get("url", "")).startswith("https://"):
            raise ValueError("Release URL must use HTTPS")
        for name in ("it", "en"):
            if not entry["title"].get(name) or not entry["changes"].get(name):
                raise ValueError("Release notes must be complete in both languages")
        return when

    ordered = sorted(records, key=check, reverse=True)
    labels = LABELS[lang]
    project_names = {}
    for entry in ordered:
        project_names.setdefault(entry["project"], entry["project_name"])

    pieces = [
        '<div class="release-filters" role="group" aria-label="'
        + escape(labels["filter_label"], quote=True) + '">',
        '<button class="release-filter is-active" type="button"'
        ' data-update-filter="all" aria-pressed="true" aria-controls="release-grid">'
        + escape(labels["all"]) + '</button>',
    ]
    for slug, label in project_names.items():
        pieces.append(
            '<button class="release-filter" type="button" data-update-filter="'
            + escape(slug, quote=True)
            + '" aria-pressed="false" aria-controls="release-grid">'
            + escape(label) + '</button>'
        )
    pieces += ['</div>', '<div class="release-grid" id="release-grid">']
    for index, entry in enumerate(ordered, 1):
        when = date.fromisoformat(entry["date"])
        short_date = (f"{when.day} {labels['date'][when.month - 1]} {when.year}"
                      if lang == "it" else
                      f"{labels['date'][when.month - 1]} {when.day}, {when.year}")
        slug = escape(entry["project"], quote=True)
        changes = ''.join(
            '<li>' + escape(str(item)) + '</li>'
            for item in entry["changes"][lang]
        )
        title = escape(entry["title"][lang])
        type_label = escape(labels[entry["type"]])
        note_id = f"update-{entry['project']}-{when.isoformat()}-{index}"
        pieces.append(
            f'<article class="release-card" id="{note_id}" data-update-project="{slug}">'
            '<div class="release-meta">'
            f'<span class="release-project">{escape(entry["project_name"])}</span>'
            f'<span class="release-kind release-kind-{entry["type"]}">{type_label}</span>'
            '</div>'
            f'<h3>{title}</h3>'
            '<div class="release-version">'
            f'<time datetime="{when.isoformat()}">{escape(short_date)}</time>'
            '<span aria-hidden="true">·</span>'
            f'<span>{escape(entry["version"])}</span>'
            '</div>'
            f'<ul>{changes}</ul>'
            '<a class="release-link" href="'
            + escape(entry["url"], quote=True)
            + '">' + escape(labels["read_more"]) + ' <span aria-hidden="true">↗</span></a>'
            '</article>'
        )
    pieces.append('</div>')
    return '\n'.join(pieces)


def inject_updates(html: str) -> str:
    if PLACEHOLDER not in html:
        raise ValueError("Missing release-feed placeholder in portfolio page")
    lang = "en" if '<html lang="en">' in html else "it"
    return html.replace(PLACEHOLDER, generate_feed(lang))
