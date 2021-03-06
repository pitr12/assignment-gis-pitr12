class Location
  def self.all_resorts(params)
    area = true;
    area = "ST_DWithin(ST_SetSRID(ST_MakePoint(#{params[:lon]}, #{params[:lat]}), 4326)::geography,way::geography,#{params[:area]})" if (params[:area].present?)

    difficulty = true;
    difficulty = get_difficulty(params[:difficulty]) if(params[:difficulty].present?)


    build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
    SELECT name, ST_Distance(ST_SetSRID(ST_MakePoint(#{params[:lon]}, #{params[:lat]}), 4326)::geography, way::geography) as distance,
                 ST_AsGeoJSON(way) as geometry, 'S' as type, tags
    FROM ski_areas AS s
    WHERE #{area} AND (#{difficulty})
    ORDER BY distance
SQL
  end

  def self.all_hotels
    build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
    SELECT name, ST_AsGeoJSON(way) as geometry, 'H' as type
    FROM hotels
SQL
  end

  def self.ski_resorts_near_hotels(params)
    area = true;
    area = "ST_DWithin(ST_SetSRID(ST_MakePoint(#{params[:lon]}, #{params[:lat]}), 4326)::geography,s.way::geography,#{params[:area]})" if (params[:area].present?)

    hotel_dist = 5000
    hotel_dist = params[:hotel_dist] if params[:hotel_dist].present?

    difficulty = true;
    difficulty = get_difficulty(params[:difficulty]) if(params[:difficulty].present?)

    build_geoJSON(ActiveRecord::Base.connection.execute(<<SQL))
    WITH ski_near_hotel AS (
      SELECT s.way as ski_geometry, s.name as ski_name, s.aerialway, s.landuse, s.leisure, s.sport, s.tags,
             hotels.way as hotel_geometry, hotels.name as hotel_name, hotels.tags as hotel_tags,
             ST_Distance(ST_SetSRID(ST_MakePoint(#{params[:lon]}, #{params[:lat]}), 4326)::geography, s.way::geography) as distance
      FROM ski_areas as s
      CROSS JOIN hotels
      WHERE ST_DWithin(s.way::geography,hotels.way::geography,#{hotel_dist}) and
            #{area} AND (#{difficulty})
      GROUP BY ski_geometry, ski_name, s.aerialway, s.landuse, s.leisure, s.sport, s.tags, hotel_geometry, hotel_name, distance, hotel_tags
    )

    SELECT hotel_name as name, 'H' as type, ST_AsGeoJSON(hotel_geometry) as geometry, '0' as distance, hotel_tags as tags
      FROM ski_near_hotel
      GROUP BY geometry, name, distance, hotel_tags
    UNION
    SELECT ski_name as name, 'S' as type, ST_AsGeoJSON(ski_geometry) as geometry, distance, tags
      FROM ski_near_hotel
      GROUP BY geometry, name, distance, tags
      ORDER BY distance
SQL
  end

  def self.get_difficulty(difficulties)
    difficulties = difficulties.split(",")
    novice = easy = intermediate = advanced = "false"
    novice = "s.tags::hstore @> '\"piste:difficulty\"=>\"novice\"'" if(difficulties.include?("novice"))
    easy = "s.tags::hstore @> '\"piste:difficulty\"=>\"easy\"'" if(difficulties.include?("easy"))
    intermediate = "s.tags::hstore @> '\"piste:difficulty\"=>\"intermediate\"'" if(difficulties.include?("intermediate"))
    advanced = "s.tags::hstore @> '\"piste:difficulty\"=>\"advanced\"'" if(difficulties.include?("advanced"))

    result = novice + " or " + easy + " or " +intermediate+ " or " +advanced
    return result
  end

  def self.build_geoJSON (locations)
    geoJSON = []
    locations.each do |location|
      if("S" == location["type"])
        geoJSON << {
            "type": "Feature",
            "geometry": JSON.parse(location["geometry"]),
            "properties": {
                "title": location["name"],
                "description": location["distance"],
                "type": location["type"],
                "marker-color": "#3887BE",
                "marker-size": "large",
                "marker-symbol": "skiing",
                "tags": location["tags"]
            }
        }
      else
        geoJSON << {
            "type": "Feature",
            "geometry": JSON.parse(location["geometry"]),
            "properties": {
                "title": location["name"],
                "type": location["type"],
                "marker-color": "#FE7569",
                "marker-size": "large",
                "marker-symbol": "lodging",
                "tags": location["tags"]
            }
        }
      end
    end
    return geoJSON
  end

end