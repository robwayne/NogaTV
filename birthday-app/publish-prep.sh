#!/usr/bin/env bash
# Builds the static export and rewrites it into out-pub/ for hosting on a
# static file host that reserves underscore-prefixed paths (like claude.ai
# artifacts). Nothing here affects `npm run dev` or a normal Vercel deploy.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf out out-pub
STATIC_EXPORT=1 npx next build

cp -r out out-pub
mv out-pub/_next out-pub/static
find out-pub -type f \( -name '*.html' -o -name '*.js' -o -name '*.txt' -o -name '*.css' \) \
  -exec sed -i 's|/_next/|/static/|g' {} +
find out-pub -maxdepth 1 -name '_*' -exec rm -rf {} +
find out-pub -name '__next*' -exec rm -f {} +
find out-pub -type d -empty -delete

# Extensionless copies so /guide and /recommendations resolve without a
# directory index.
cp out-pub/guide.html out-pub/guide
cp out-pub/recommendations.html out-pub/recommendations

echo "published tree ready in out-pub/"

# The legacy polyfill chunk is served only to browsers without ES modules, and
# it contains bytes that some static hosts reject. Modern phones never load it,
# so drop it and its noModule script tags.
POLYFILL=$(grep -ho 'src="[^"]*"[^>]*noModule' out-pub/*.html | head -1 | sed 's|src="/static/||; s|"[^"]*$||')
if [ -n "${POLYFILL:-}" ]; then
  rm -f "out-pub/static/$POLYFILL"
  sed -i 's|<script src="/static/[^"]*" noModule=""></script>||g' out-pub/*.html
  echo "dropped polyfill chunk: $POLYFILL"
fi
