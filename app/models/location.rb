class Location
  def self.test
    #point
    build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
      SELECT name, ST_AsGeoJSON(ST_Transform(way,4326)) as geometry
      FROM planet_osm_point
      WHERE leisure='ski_resort'
         or sport='skiing'
         or landuse='winter_sports'
SQL
#     #polygon
#     build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
#       SELECT name, ST_AsGeoJSON(ST_Transform(way,4326)) as geometry
#       FROM planet_osm_polygon
#       WHERE osm_id='190874707' and (
#         leisure='ski_resort'
#         or sport='skiing'
#         or landuse='winter_sports'
#       )
# SQL
  end

  def self.build_geoJSON (locations)
    geoJSON = []
    locations.each do |location|
      geoJSON << {
          "type": "Feature",
          "geometry": JSON.parse(location["geometry"]),
          "properties": {
              "title": location["name"],
              "marker-color": "#3887BE",
              "marker-size": "large",
              "marker-symbol": "skiing"
          }
      }
    end
    return geoJSON
  end
end