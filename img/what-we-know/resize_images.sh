#!/bin/bash
# Converts all JPG/PNG images in the current folder to optimized WebP
# Keeps originals and saves .webp files into a new "webp" folder
# Requires: ImageMagick (brew install imagemagick)

mkdir -p webp

for img in *.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [ -e "$img" ] || continue
  base="${img%.*}"
  echo "Converting $img → webp/${base}.webp ..."
  
  magick "$img" \
    -strip \
    -resize 1600 \
    -define webp:method=6 \
    -quality 80 \
    -sampling-factor 4:2:0 \
    "webp/${base}.webp"
done

echo "✅ Done! Optimized WebP images saved in /webp"
