#!/usr/bin/env python3
"""SignalScope: responsible website content change tracking (Python stdlib)."""
import argparse
import difflib
import hashlib
import html
from html.parser import HTMLParser
import ipaddress
import json
import re
import sqlite3
import sys
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser
import socket

AGENT = "SignalScope/0.1 (+https://github.com/GiovanniDelGaudio1994/forma-ai)"
MAX_BYTES = 1_000_000

class Extractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hidden = 0
        self.text = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.hidden += 1
        if tag in ("p", "h1", "h2", "h3", "li", "article", "section", "br"):
            self.text.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self.hidden = max(0, self.hidden - 1)
        if tag in ("p", "h1", "h2", "h3", "li", "article", "section"):
            self.text.append("\n")
    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)

def extract_text(page):
    parser = Extractor()
    parser.feed(page)
    lines = [re.sub(r"\s+", " ", html.unescape(s)).strip() for s in "".join(parser.text).splitlines()]
    return "\n".join(line for line in lines if line)

def validate_url(url):
    parts = urlsplit(url)
    if parts.scheme not in ("https", "http") or not parts.hostname or parts.username or parts.password:
        raise ValueError("Only public http(s) URLs without embedded credentials are accepted")
    if parts.port and parts.port not in (80, 443):
        raise ValueError("Only standard web ports are allowed")
    host = parts.hostname.lower()
    if host == "localhost" or host.endswith(".local"):
        raise ValueError("Local hosts are forbidden")
    try:
        addresses = socket.getaddrinfo(host, parts.port or (443 if parts.scheme == "https" else 80))
    except socket.gaierror as exc:
        raise ValueError(f"Cannot resolve hostname: {exc}") from exc
    if not addresses or any(not ipaddress.ip_address(addr[4][0]).is_global for addr in addresses):
        raise ValueError("Only publicly routable hosts are allowed")
    return parts

class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        old = urlsplit(req.full_url)
        new = validate_url(newurl)
        if old.hostname != new.hostname or old.scheme != new.scheme:
            raise ValueError("Cross-host or protocol redirects are not supported")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def fetch(url, maximum=MAX_BYTES):
    validate_url(url)
    opener = build_opener(SafeRedirect)
    request = Request(url, headers={"User-Agent": AGENT, "Accept": "text/html"})
    with opener.open(request, timeout=15) as response:
        content_type = response.headers.get_content_type()
        if content_type not in ("text/html", "text/plain"):
            raise ValueError("This tool only supports HTML or plain text pages")
        data = response.read(maximum + 1)
        if len(data) > maximum:
            raise ValueError("Page too large (max 1 MB)")
        charset = response.headers.get_content_charset() or "utf-8"
        return data.decode(charset, errors="replace"), response.geturl()

def permitted(url):
    p = validate_url(url)
    robots_url = f"{p.scheme}://{p.netloc}/robots.txt"
    try:
        body, _ = fetch_robots(robots_url)
    except Exception as exc:
        raise ValueError(f"Could not verify robots.txt; refusing to crawl: {exc}") from exc
    robots = RobotFileParser()
    robots.parse(body.splitlines())
    if not robots.can_fetch(AGENT, url):
        raise ValueError("robots.txt disallows this path")
    return True

def fetch_robots(url):
    validate_url(url)
    opener = build_opener(SafeRedirect)
    try:
        with opener.open(Request(url, headers={"User-Agent": AGENT}), timeout=15) as r:
            raw = r.read(512_001)
            if len(raw) > 512_000:
                raise ValueError("robots.txt too large")
            return raw.decode("utf-8", errors="replace"), r.geturl()
    except HTTPError as exc:
        if exc.code in (404, 410):
            return "", url
        raise

def connect(path):
    db = sqlite3.connect(path)
    db.execute("""CREATE TABLE IF NOT EXISTS snapshots
        (id INTEGER PRIMARY KEY, url TEXT NOT NULL, checked_at TEXT NOT NULL,
        fingerprint TEXT NOT NULL, content TEXT NOT NULL)""")
    db.execute("CREATE INDEX IF NOT EXISTS idx_snapshots_url ON snapshots(url, id)")
    return db

def check(url, db_path):
    permitted(url)
    page, final = fetch(url)
    text = extract_text(page) if "<" in page else page.strip()
    digest = hashlib.sha256(text.encode()).hexdigest()
    db = connect(db_path)
    try:
        old = db.execute("SELECT fingerprint, content FROM snapshots WHERE url=? ORDER BY id DESC LIMIT 1", (url,)).fetchone()
        status = "first_snapshot" if not old else ("unchanged" if digest == old[0] else "changed")
        diff = ""
        if old and status == "changed":
            diff = "\n".join(difflib.unified_diff(old[1].splitlines(), text.splitlines(),
                fromfile="previous", tofile="current", lineterm=""))
        if status != "unchanged":
            with db:
                db.execute("INSERT INTO snapshots (url,checked_at,fingerprint,content) VALUES (?,?,?,?)",
                    (url, datetime.now(timezone.utc).isoformat(), digest, text))
        return {"url": url, "resolved_url": final, "status": status, "sha256": digest,
                "characters": len(text), "diff": diff}
    finally:
        db.close()

def history(url, db_path):
    db = connect(db_path)
    try:
        return [{"checked_at": row[0], "sha256": row[1], "characters": len(row[2])}
                for row in db.execute("SELECT checked_at,fingerprint,content FROM snapshots WHERE url=? ORDER BY id DESC", (url,))]
    finally:
        db.close()

def main(argv=None):
    p = argparse.ArgumentParser(description="Monitor changes on publicly accessible web pages")
    p.add_argument("command", choices=["check", "history"])
    p.add_argument("url", help="Public http(s) webpage URL")
    p.add_argument("--db", default="signalscope.sqlite3", help="SQLite history path")
    a = p.parse_args(argv)
    try:
        result = check(a.url, a.db) if a.command == "check" else history(a.url, a.db)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0
    except (ValueError, HTTPError, URLError, OSError, sqlite3.Error, UnicodeError) as e:
        print(f"SignalScope error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
