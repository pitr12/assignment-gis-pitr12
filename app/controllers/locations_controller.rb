class LocationsController < ApplicationController
  def index
    result = Location.all_resorts(location_params)
    render :json => result
  end

  def hotels
    result = Location.all_hotels
    render :json => result
  end

  def ski_near_hotels
    result = Location.ski_resorts_near_hotels(hotel_params)
    render :json => result
  end

  def location_params
    params.permit(:lat, :lon, :area, :difficulty)
  end

  def hotel_params
    params.permit(:lat, :lon, :area, :hotel_dist, :difficulty)
  end
end
