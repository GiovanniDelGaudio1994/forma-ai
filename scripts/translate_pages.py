#!/usr/bin/env python3
"""Create SEO-indexable English pages from the maintained Italian sources.

Translations live in scripts/locale_data.json, not in executable inline JS.
The English pages use the same first-party JS/CSS as the Italian originals.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "scripts/locale_data.json").read_text(encoding="utf-8"))
TEXT_NODE = re.compile(r">([^<>]+)<")


def translate(source: str, section: str) -> str:
    translations = DATA[section]["text"]

    def replace_node(match: re.Match[str]) -> str:
        raw = match.group(1)
        label = raw.strip()
        replacement = translations.get(label)
        if replacement is None:
            return match.group(0)
        prefix = raw[: len(raw) - len(raw.lstrip())]
        suffix = raw[len(raw.rstrip()):]
        return ">" + prefix + replacement + suffix + "<"

    output = TEXT_NODE.sub(replace_node, source)
    for old, new in DATA[section]["attributes"].items():
        if old not in output:
            continue  # Optional attributes may change as the page evolves.
        output = output.replace(old, new)

    output = output.replace('<html lang="it">', '<html lang="en">')
    if section == "portfolio":
        output = output.replace(
            'content="Portfolio ufficiale di Giovanni Del Gaudio, sviluppatore software e studente dell\'Università degli Studi di Salerno. Progetti in Flutter, AI, PHP, Java e web development."',
            'content="Giovanni Del Gaudio, software developer and Computer Science student. Explore projects in Flutter, AI, PHP, Java, systems programming and web development."',
        )
        output = output.replace(
            'content="Software che prende forma. Applicazioni, AI, esperienze digitali e progetti universitari."',
            'content="Software made tangible: applications, AI, digital experiences, hardware research and university projects."',
        )
        output = output.replace('content="it_IT"', 'content="en_US"')
        output = output.replace(
            'content="https://giovannidelgaudio.it/"',
            'content="https://giovannidelgaudio.it/en/"',
            1,  # og:url
        )
        output = output.replace(
            '<link rel="canonical" href="https://giovannidelgaudio.it/">',
            '<link rel="canonical" href="https://giovannidelgaudio.it/en/">',
        )
        output = output.replace(
            '"description":"Software developer e studente universitario, con progetti di app mobile, AI e sviluppo web"',
            '"description":"Software developer and Computer Science student building mobile, web, AI and systems projects"',
        )
        output = output.replace(
            '<title>Giovanni Del Gaudio | Software Developer · Portfolio</title>',
            '<title>Giovanni Del Gaudio | Software Developer · Portfolio (English)</title>',
        )
        output = output.replace(
            'data-locale="it" aria-current="page"',
            'data-locale="it"',
        )
        output = output.replace(
            'data-locale="en" aria-label="English version"',
            'data-locale="en" aria-current="page" aria-label="English version"',
        )
    else:
        output = output.replace(
            'content="LegacyBridge: diagnostica hardware legacy e ricerca sulla compatibilità. Primo esperimento HP 550."',
            'content="LegacyBridge: responsible legacy hardware diagnostics and compatibility research. HP 550 case study."',
        )
        output = output.replace(
            'data-locale="it" aria-current="page"',
            'data-locale="it"',
        )
        output = output.replace(
            'data-locale="en" aria-label="English version"',
            'data-locale="en" aria-current="page" aria-label="English version"',
        )
        output = output.replace(
            '<link rel="canonical" href="https://giovannidelgaudio.it/legacybridge-demo/">',
            '<link rel="canonical" href="https://giovannidelgaudio.it/legacybridge-demo/en/">',
        )

    return output


def translate_portfolio(source: str) -> str:
    return translate(source, "portfolio")


def translate_legacybridge(source: str) -> str:
    return translate(source, "legacybridge")
