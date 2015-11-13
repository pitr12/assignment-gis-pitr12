class LocationsController < ApplicationController
  def index
    result = Location.all_resorts(location_params)
    render :json => result
  end

  def location_params
    params.permit(:lat, :lon, :area)
  end
end
