#!/bin/bash
set -e

echo "Building Next.js static export..."
npx next build

echo "Creating output directory..."
rm -rf dist
mkdir -p dist

echo "Copying static pages..."
cp -r .next/server/app/*.html dist/ || true
cp -r .next/server/app/refresh dist/ || true
cp -r .next/server/app/capex dist/ || true

echo "Copying static assets..."
mkdir -p dist/_next
cp -r .next/static dist/_next/static

echo "Copying public assets..."
cp -r public/* dist/

echo "Pages build complete. Output in dist/"
