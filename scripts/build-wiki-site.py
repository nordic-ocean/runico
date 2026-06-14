#!/usr/bin/env python3
"""Convert the wiki/ Markdown into a MkDocs source tree.

The pages under wiki/ are authored in GitHub-Wiki flavour: intra-wiki links are
bare page names — ``[Adding Cards](Adding-Cards)`` — and navigation lives in
``_Sidebar.md`` / ``_Footer.md``. MkDocs instead wants relative ``.md`` links and
drives navigation from ``mkdocs.yml`` + the theme. This script bridges the two so
wiki/ stays the single source of truth.

For each page it:
  * rewrites ``[text](Page-Name)`` -> ``[text](Page-Name.md)`` (and ``Home`` ->
    ``index.md``), leaving external/anchor links untouched;
  * renames ``Home.md`` -> ``index.md`` (MkDocs' home);
  * drops the redundant footer nav (the GitBook theme provides it);
  * skips ``_Sidebar.md`` / ``_Footer.md`` (GitHub-Wiki chrome).

Usage:  python scripts/build-wiki-site.py <src-dir> <out-dir>
"""
import os
import re
import glob
import shutil
import sys

LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')


def _rewrite_link(m):
    text, target = m.group(1), m.group(2)
    if re.match(r'^(https?:|mailto:|#)', target):
        return m.group(0)
    base, _, frag = target.partition('#')
    if base in ('Home', ''):
        base = 'index'
    return '[%s](%s)' % (text, base + '.md' + (('#' + frag) if frag else ''))


def _is_footer_nav(line):
    l = line.strip()
    return l.startswith('<div align="center"><sub>') and (
        'href="Home"' in l or 'Runico ·' in l or '· Next:' in l
    )


def main(src, dst):
    shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(dst)
    n = 0
    for f in sorted(glob.glob(os.path.join(src, '*.md'))):
        b = os.path.basename(f)
        if b in ('_Sidebar.md', '_Footer.md'):
            continue
        with open(f, encoding='utf-8') as fh:
            s = LINK.sub(_rewrite_link, fh.read())
        s = '\n'.join(ln for ln in s.split('\n') if not _is_footer_nav(ln)).rstrip() + '\n'
        out = 'index.md' if b == 'Home.md' else b
        with open(os.path.join(dst, out), 'w', encoding='utf-8') as fh:
            fh.write(s)
        n += 1
    # Copy static assets referenced by mkdocs.yml (e.g. extra.css) into the build.
    assets = 0
    if os.path.isdir('docs-assets'):
        for a in glob.glob('docs-assets/*'):
            if os.path.isfile(a):
                shutil.copy(a, os.path.join(dst, os.path.basename(a)))
                assets += 1
    print('Converted %d pages (+%d assets): %s -> %s' % (n, assets, src, dst))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('usage: build-wiki-site.py <src-dir> <out-dir>')
    main(sys.argv[1], sys.argv[2])
