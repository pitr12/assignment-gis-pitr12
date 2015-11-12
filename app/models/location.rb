class Location
  def self.all_resorts(params)
    build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
     SELECT name, ST_Distance(ST_SetSRID(ST_MakePoint('#{params[:lon]}', '#{params[:lat]}'), 4326)::geography, way::geography) as distance,
                  ST_AsGeoJSON(way) as geometry
     FROM ski_areas
     ORDER BY distance
SQL
  end

  def self.build_geoJSON (locations)
    geoJSON = []
    locations.each do |location|
      geoJSON << {
          "type": "Feature",
          "geometry": JSON.parse(location["geometry"]),
          "properties": {
              "title": location["name"],
              "description": location["distance"],
              "marker-color": "#3887BE",
              "marker-size": "large",
              "marker-symbol": "skiing"
          }
      }
    end
    return geoJSON
  end
end