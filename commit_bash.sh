git reset --mixed HEAD 2>/dev/null
git config core.quotepath false

# Create batches of 500 files and commit them
git ls-files --others --exclude-standard | split -l 500 - batch_
for file in batch_*; do
    echo "Processing $file..."
    cat "$file" | tr '\n' '\0' | xargs -0 git add
    git commit -m "Upload em lote ($file)"
    rm "$file"
done
echo "DONE"
