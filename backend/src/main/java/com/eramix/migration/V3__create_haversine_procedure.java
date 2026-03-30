package com.eramix.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Statement;

/**
 * V3 — Crea el stored procedure findUsersNearby (Haversine).
 * Se implementa como migración Java porque el CREATE PROCEDURE
 * contiene delimitadores ';' internos que Flyway Community no
 * puede manejar correctamente en migraciones SQL.
 */
public class V3__create_haversine_procedure extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        try (Statement stmt = context.getConnection().createStatement()) {

            stmt.execute("DROP PROCEDURE IF EXISTS findUsersNearby");

            stmt.execute("""
                CREATE PROCEDURE findUsersNearby(
                    IN p_latitude   DECIMAL(10, 7),
                    IN p_longitude  DECIMAL(10, 7),
                    IN p_radius_km  DOUBLE,
                    IN p_user_id    BIGINT
                )
                BEGIN
                    SELECT
                        u.id,
                        u.first_name,
                        u.last_name,
                        u.profile_photo_url,
                        u.destination_city,
                        u.destination_country,
                        u.latitude,
                        u.longitude,
                        (
                            6371 * ACOS(
                                LEAST(1, GREATEST(-1,
                                    COS(RADIANS(p_latitude))
                                    * COS(RADIANS(u.latitude))
                                    * COS(RADIANS(u.longitude) - RADIANS(p_longitude))
                                    + SIN(RADIANS(p_latitude))
                                    * SIN(RADIANS(u.latitude))
                                ))
                            )
                        ) AS distance_km
                    FROM user u
                    WHERE u.id != p_user_id
                      AND u.is_active = TRUE
                      AND u.latitude IS NOT NULL
                      AND u.longitude IS NOT NULL
                    HAVING distance_km <= p_radius_km
                    ORDER BY distance_km ASC;
                END
                """);
        }
    }
}
