#!/bin/bash
# ====================================================================
# STAGING K6 LOAD TEST BENCHMARK RUNNER & EVIDENCE COLLECTOR
# ====================================================================

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
STAGING_URL="${1:-https://staging.axonflow-beta.vercel.app}"
LOG_DIR="artifacts/benchmarks"
OUTPUT_FILE="${LOG_DIR}/k6_benchmark_${TIMESTAMP}.json"

echo "=== STARTING EMPIRICAL K6 LOAD TEST BENCHMARK ==="
echo "Target Staging URL: ${STAGING_URL}"
echo "Output Log File: ${OUTPUT_FILE}"

mkdir -p "${LOG_DIR}"

# Execute k6 load test script with JSON metric output logging
k6 run \
  -e BASE_URL="${STAGING_URL}" \
  -e DISABLE_TURNSTILE_IN_LOADTEST="true" \
  --out json="${OUTPUT_FILE}" \
  scripts/k6-load-test.js

echo "=== BENCHMARK COMPLETE ==="
echo "Evidence Log Saved To: ${OUTPUT_FILE}"
