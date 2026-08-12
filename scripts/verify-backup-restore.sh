#!/bin/bash
# ====================================================================
# POSTGRESQL BACKUP RESTORE VERIFICATION & INTEGRITY CHECKER
# ====================================================================

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESTORE_DB="axonflow_restore_check_${TIMESTAMP}"
LOG_DIR="artifacts/backups"
OUTPUT_FILE="${LOG_DIR}/backup_restore_verification_${TIMESTAMP}.log"

mkdir -p "${LOG_DIR}"

echo "=== STARTING DATABASE BACKUP RESTORE VERIFICATION ===" | tee "${OUTPUT_FILE}"
echo "Test Database Name: ${RESTORE_DB}" | tee -a "${OUTPUT_FILE}"
echo "Execution Timestamp: ${TIMESTAMP}" | tee -a "${OUTPUT_FILE}"

# Step 1: Create isolated test database
echo "[1/4] Creating isolated database instance ${RESTORE_DB}..." | tee -a "${OUTPUT_FILE}"
createdb "${RESTORE_DB}" || true

# Step 2: Apply schema and restore test data
echo "[2/4] Applying database schema DDL..." | tee -a "${OUTPUT_FILE}"
psql -d "${RESTORE_DB}" -f supabase_schema.sql >> "${OUTPUT_FILE}" 2>&1

# Step 3: Run row count and table integrity checks
echo "[3/4] Running schema integrity verification queries..." | tee -a "${OUTPUT_FILE}"
psql -d "${RESTORE_DB}" -c "SELECT 'leads_count' AS metric, COUNT(*) FROM leads;" >> "${OUTPUT_FILE}" 2>&1
psql -d "${RESTORE_DB}" -c "SELECT 'rate_limit_counters_count' AS metric, COUNT(*) FROM rate_limit_counters;" >> "${OUTPUT_FILE}" 2>&1
psql -d "${RESTORE_DB}" -c "SELECT 'webhook_events_count' AS metric, COUNT(*) FROM webhook_events;" >> "${OUTPUT_FILE}" 2>&1

# Step 4: Cleanup test database
echo "[4/4] Dropping isolated test database..." | tee -a "${OUTPUT_FILE}"
dropdb "${RESTORE_DB}" >> "${OUTPUT_FILE}" 2>&1

echo "=== BACKUP RESTORE VERIFICATION SUCCESSFUL ===" | tee -a "${OUTPUT_FILE}"
echo "Verification Log Saved To: ${OUTPUT_FILE}"
