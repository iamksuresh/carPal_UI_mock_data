import axios from 'axios'
import {Restaurants,FavouriteRestaurants} from './Mock'

export default class Api {
    static async Get(type){
        switch(type){
            case 'restaurants' : return Restaurants ; //return axios.get('/restaurants');
            case 'favourites' : return FavouriteRestaurants; //axios.get('/favourites');
            default : return Restaurants;
        }
    }

    static async DELETE(type,id){
        switch(type){            
            case 'favourites' : return FavouriteRestaurants; //axios.delete(`/favourites/${id}`);
            default : return Restaurants;
        }
    }

    static async PUT(type,params){
        switch(type){            
            case 'favourites' : return FavouriteRestaurants; //axios.put(`/favourites/`,params);
            default : return Restaurants;
        }
    }


}
