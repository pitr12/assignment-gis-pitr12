class LocationsController < ApplicationController
  def index
    result = Location.test
    render :json => result
  end
end
