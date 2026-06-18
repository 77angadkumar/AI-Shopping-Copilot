#!/bin/bash

# =========================================================================
# amzRufus - Database Seeding Orchestrator Script (bash)
# =========================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the project root directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../.."

echo "--------------------------------------------------"
echo "🚀 Initializing amzRufus Catalog Generation..."
echo "--------------------------------------------------"
node backend/scripts/generateCatalog.js

echo ""
echo "--------------------------------------------------"
echo "💾 Seeding Catalog into MongoDB..."
echo "--------------------------------------------------"
npx tsx backend/seeds/seed.ts

echo ""
echo "✅ Seeding Orchestration Complete!"
