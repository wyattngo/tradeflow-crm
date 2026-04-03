#!/bin/sh
sleep 5
mc alias set local http://minio:9000 minioadmin minioadmin123
mc mb --ignore-existing local/tradeflow-docs
mc anonymous set download local/tradeflow-docs
echo "MinIO bucket initialized."
