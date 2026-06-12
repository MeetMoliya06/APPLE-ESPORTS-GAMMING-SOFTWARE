docker exec neon-erp-db psql -U erp_user -d erp_db -f /docker-entrypoint-initdb.d/drop.sql
docker exec neon-erp-db psql -U erp_user -d erp_db -f /docker-entrypoint-initdb.d/seed.sql
docker exec neon-erp-db psql -U erp_user -d erp_db -f /docker-entrypoint-initdb.d/update_permissions.sql
docker exec neon-erp-db psql -U erp_user -d erp_db -f /docker-entrypoint-initdb.d/update_inventory.sql
docker exec neon-erp-db psql -U erp_user -d erp_db -f /docker-entrypoint-initdb.d/update_inventory2.sql
