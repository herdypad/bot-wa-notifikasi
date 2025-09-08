#!/bin/bash

# Cara menggunakan:
# 1. Pastikan file ini executable: chmod +x gitpus.sh
# 2. Jalankan script: ./gitpus.sh
# 3. Atau jalankan dengan: bash gitpus.sh


# Auto git push script

# Add all changes
git add .

# Commit with timestamp
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to remote repository
git push