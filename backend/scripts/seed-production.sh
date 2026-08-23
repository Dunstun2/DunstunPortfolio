#!/bin/bash

# Seed Corporate Website Data to Production (Railway)
# ===================================================
# This script is designed to run FROM Railway, where it has access to the internal database.
# 
# Usage (from Railway CLI):
#   railway run bash backend/scripts/seed-production.sh
#
# Or directly in Railway deployment as a build command

echo "🌱 Corporate Production Seed Script"
echo "===================================="
echo ""

# Check if corporate-dev-export.json exists
if [ ! -f "backend/scripts/corporate-dev-export.json" ]; then
    echo "❌ FATAL: corporate-dev-export.json not found!"
    echo "   This script requires the exported development data."
    echo ""
    echo "   To generate it, run in development:"
    echo "   node backend/scripts/export-corporate-dev.js"
    echo ""
    echo "   Then commit/push to your repository."
    exit 1
fi

echo "✅ Found corporate-dev-export.json"
echo ""

# Run the seed script
# DATABASE_URL is automatically available in Railway environment
NODE_ENV=production node backend/scripts/seed-corporate-production.js

exit $?
