-----------------ALL SKI AREAS-------------------------------
-----------------------------------------------------------------
CREATE MATERIALIZED VIEW ski_areas AS
    SELECT name, aerialway, landuse, leisure, sport, tags, ST_Transform(way,4326) as way
    FROM planet_osm_polygon
    WHERE leisure='ski_resort'
      or sport='skiing'
      or landuse='winter_sports'
      or landuse='piste'
  UNION
    SELECT name, aerialway, landuse, leisure, sport, tags, ST_Transform(way,4326) as way
    FROM planet_osm_line
    WHERE leisure='ski_resort'
      or sport='skiing'
      or landuse='winter_sports'
  UNION
    SELECT name, aerialway, landuse, leisure, sport, tags, ST_Transform(way,4326) as way
    FROM planet_osm_point
    WHERE leisure='ski_resort'
      or sport='skiing'
      or landuse='winter_sports'
----------------------------------------------------------------
