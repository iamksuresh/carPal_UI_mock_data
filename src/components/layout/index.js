import React, { useEffect,useState } from 'react';
import { 
    Container,
    Grid,
    Segment
} from 'semantic-ui-react'
import GoogleMap from '../map'
import FavouriteRestaurants from '../favourites/FavouriteRestaurants'
import { StateProvider } from '../FavouriteContext'

const Layout = (props) => {
    const [favouritesList,setFavouritesList] = useState([])
    const[listHeight , setListHeight] = useState(window.innerHeight)
    /* https://medium.com/simply/state-management-with-react-hooks-and-context-api-at-10-lines-of-code-baf6be8302c */
    const reducer = (state, action) => {
        switch (action.type) {
          case 'update':
            return { favouritesList: action.favouritesList };    
        case 'maphighlight':
            return {highlight : action.restaurant_id}; 
        case 'mapnormal':
            return {normal : action.restaurant_id};                 
        default:
            return state;
        }
    };

    const updateHeight = () => {
        setListHeight(window.innerHeight)
    }

    useEffect(()=>{
        window.addEventListener('resize',updateHeight );
        return( window.removeEventListener('resize',{}))
    },[])

    return(
        <StateProvider initialState={0} reducer={reducer}>
        <Grid padded>
            <Grid.Row >
                <Grid.Column
                    largeScreen={10}
                    widescreen={10}
                    computer={10}
                    mobile={16}
                    tablet={10} 
                >       
                    <div>          
                    <GoogleMap {...props} />
                    </div>   
                </Grid.Column>
                <Grid.Column
                    largeScreen={6}
                    widescreen={6}
                    computer={6}
                    mobile={16}
                    tablet={10} 
                >
                    <Container
                        style={{
                            maxHeight:`${listHeight-50}px`,
                            overflowY:'scroll'
                        }}
                    >
                        <h5>My Favourites Restaurants</h5>
                        <FavouriteRestaurants {...props} />                        
                    </Container>
                </Grid.Column>
            </Grid.Row>
        </Grid>
        </StateProvider>
    )
}

export default Layout;