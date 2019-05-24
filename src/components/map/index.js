import React, { useState , useEffect, useRef , useContext} from 'react';
import GoogleMapReact from 'google-map-react';
import Api from '../../Api'
import Loader from '../utils/Loader'
import { Icon, Rating , Grid, Segment , Dropdown, Image, Sidebar, Menu,List} from 'semantic-ui-react'
import Styled from 'styled-components'
import { useStateValue } from '../FavouriteContext'

const IsOpen = Styled.div`
    position: absolute;
    width: ${props => props.shouldhighlight ? '60px' : '40px'} ;     
    height: ${props => props.shouldhighlight ? '60px' : '40px'} ; 
    left: -20px;
    top: -20px;
    border: ${props => props.isOPen ? '5px solid green' : '5px solid #f44336'} ;
    border-radius: 40px;
    background-color: white;
    text-align: center;
    color: #3f51b5;
    font-size: 16px   
    font-weight: bold;
    padding:  ${props => props.shouldhighlight ? '8px' : '4px'} ;  
    cursor : pointer;
`
const infoWindowStyle = {
    position: 'relative',
    bottom: 120,
    left: '-30px',
    width: 260,
    backgroundColor: 'white',
    boxShadow: '0 2px 7px 1px rgba(0, 0, 0, 0.3)',
    padding: 10,
    fontSize: 14,
    zIndex: 2000,
    borderRadius : '4px',
    textAlign:'left',
};

const SideBarClose = Styled(Icon)`
    float: right
    cursor : pointer
    color: #1a73e8
`
const GoogleMap = (props) => {
    const [loading, setLoading] = useState(false)
    const [restaurantsList, setRestaurantsList] = useState([])
    const [showRestaurantsOnMap, setShowRestaurantsOnMap] = useState([])
    const [filterBy,setFilterBy] = useState('all')
    const [restaurantCategories, setRestaurantCategories] = useState([])
    const [showMarkers, setShowMarkers] = useState(false)
    const [animation , setAnimation] = useState({})
    const [showInfoWindow , setShowInfoWindow] = useState({})
    const [favouritesList , setfavouritesList] = useState([])
    const [sideBarVisible , setSideBarVisible] = useState(false)
    const [shouldHighlight,setShouldHighlight] = useState({})
    const [showError ,setShowError] = useState(false)
    const ERROR_TEXT = 'Error in loading Api data'

    const Map = useRef()
    let markers = []
    const [state, dispatch] = useStateValue(); 
    useEffect(()=>{
        if(state && state.favouritesList){
            setfavouritesList(state.favouritesList)
        }
        if(state && state.highlight ){
            let allKeys = Object.keys(shouldHighlight)
            let tempObj =shouldHighlight            
            allKeys.map( (val) => {
                tempObj[val] = 
                    state.highlight !== parseInt(val)
                        ? false
                        : true
            })
            setShouldHighlight({
                ...tempObj
            })            
        }
        if(state && state.normal){
            normalizeAllMarkers()            
        }
    },[state])

    
    useEffect( ()=>{
        /* Fetch restaurants on map load */
        setLoading(true)
        Api.Get('restaurants')
            .then(resp => {
                //console.log('resp ', resp.data.result)
                setRestaurantsList(resp.data.result) 
                updateStates(resp.data.result)            
                setLoading(false)
            },err => {
                setLoading(false)
                setShowError(true)
            })
        
            
    },[])
    
    useEffect( ()=>{
        if(filterBy !== 'all'){
            let x = restaurantsList.filter( (val)=>{
                return val.category === filterBy
             })
             normalizeAllMarkers()
             setShowRestaurantsOnMap(x)
        }else{
            normalizeAllMarkers()
            setShowRestaurantsOnMap(restaurantsList)
        }
    },[filterBy])

    const normalizeAllMarkers = () => {
        let allKeys = Object.keys(shouldHighlight)
        let tempObj =shouldHighlight            
        allKeys.map( (val) => {
            tempObj[val] = false
        })
        setShouldHighlight({
            ...tempObj
        })  
    }
    
    const checkIfOpen = (open , close) => {
        let currTime = new Date().getHours()
        return currTime < parseFloat(close) && currTime > parseFloat(open)
            ? true
            : false
    }

    const updateStates = (resp) => {
        let tempCategory = [], animation = {} , forInfo = {} , highlight ={}
        filterBy === 'all' && setShowRestaurantsOnMap(resp) 

        resp.forEach( (val,i) => {
            /* All categories */
        let isAvailable = tempCategory.length>0 &&
            tempCategory.filter(v=>v.key === val.category)
            //!tempCategory.includes(val.category)
            if(!isAvailable || isAvailable.length === 0 ){
                var label = 
                    val.category === 'pizza'
                        ? 'Pizza & Burgers'
                        : val.category === 'noodles'
                            ? 'Pasta/Noodles & Rice Bowls'
                            : val.category

                tempCategory.push({                  
                    key: val.category,
                    text: label,
                    value: val.category,                    
                })
            }                  

            forInfo[val.id] = false
            animation[val.id] = checkIfOpen(val.timing.open,val.timing.close)
            highlight[val.id] = false
           
        })
        tempCategory.length > 0 && 
        tempCategory.push({
            key: 'all',
            text: 'All Restaurants',
            value: 'all', 
        })
        setRestaurantCategories(tempCategory)
        setAnimation({...animation})
        setShowInfoWindow({...forInfo})
        setShouldHighlight({...highlight})
    }
    

    const  MyMarker = () => {
        markers =  showRestaurantsOnMap.map( (val) => {
            return(
                <IsOpen 
                    title={val.title}
                    key = {val.id}
                    {...val.position}
                    clickable 
                    isOPen = {animation[val.id]}
                    shouldhighlight = {shouldHighlight[val.id]}
                    id={val.id}
                    obj = {val}
                >
                    {
                        val.icon ? 
                            <Image
                                src = {val.icon }
                                style={{padding:'2px'}}
                                //onClick = { toggleBounce.bind(this,val)}                    
                            />
                        : <Icon name='food'/>     
                    }   
                    {
                        showInfoWindow[val.id] && InfoContent(val)
                    }            
                </IsOpen>
            )
        })        
        return markers        
    }
    
    const mapsLoaded = (map, maps) => {
        setShowMarkers(true)
    }

    const _onChildClick = (key) => {
        //setShowInfoWindow(!showInfoWindow) 
        let x = {}
        x[key] = !showInfoWindow[key]
        setShowInfoWindow({
            ...showInfoWindow,
            ...x
        })

        let y = {}
        let selected = markers.filter ( val => val.key === key)
        y[key] = selected.length > 0 &&
            checkIfOpen(selected[0].props.obj.timing.open,selected[0].props.obj.timing.close)

        setAnimation({
            ...animation,
            ...y
        })
    }

    const closeInfoWindow = (key) => {
        let x = {}
        x[key] = !showInfoWindow[key]
        setShowInfoWindow({
            ...showInfoWindow,
            ...x
        })
    }

    const toggleFromFavourite = (data) => {
        let tempArr = favouritesList  
        let isAvailable = favouritesList.filter(val => val.id === data.marker_id)
        if(isAvailable.length > 0 ){
            Api.DELETE('favourites', data.marker_id)
                .then(resp=> {
                    //setFavouritesList(resp.data.result)
                    dispatch({
                        type: 'update',
                        favouritesList: resp.data.result
                    })
                })
        }else{
            let sampleFavouriteObj = {
                "id": data.currObj.id,
                "place": data.currObj.place,
                "timing": {...data.currObj.timing},
                "category": data.currObj.category,
                "description": data.currObj.description,
                "name": data.currObj.name,
                "icon" : data.currObj.icon, 
                "rating": data.currObj.rating, 
            }
            Api.PUT('favourites', sampleFavouriteObj)
                .then(resp=> {
                    //setFavouritesList(resp.data.result)
                    dispatch({
                        type: 'update',
                        favouritesList: resp.data.result
                    })
                })
        }
    }
    
    const InfoContent = ({...currObj }) => {
        return (
            <div style={infoWindowStyle}> 
                <h5> 
                    {currObj.name}
                    {
                        <Icon 
                            name={
                                favouritesList.length>0 &&
                                    (favouritesList.filter(val => val.id === currObj.id)).length === 1
                                    ? 'heart'
                                    : 'heart outline'
                            }
                            marker_id = {currObj.id}
                            currObj = {currObj}
                            onClick = {((e,data) => toggleFromFavourite(data))}
                            style={{marginLeft:'20px' , marginRight:'10px'}}
                        /> 
                    }
                    
                    
                    <span style={{float:'right'}}>
                        <Icon name='close' onClick ={()=>closeInfoWindow(currObj.id)} title="close"/> 
                    </span>
                </h5> 
                <div
                    style={{
                        color : animation[currObj.id] ? 'green' : '#f44336'
                    }}
                >
                    {
                        animation[currObj.id] ? `Open Now ` : `Closed Now `                   
                    }
                </div>
                <div> <Rating icon='star' defaultRating={currObj.rating} maxRating={5} disabled /></div>
                <div>  
                    <Icon name='clock outline' />                      
                    Working Hours : {currObj.timing.open} - {currObj.timing.close}                    
                </div>
                <div
                    onClick={ () => setSideBarVisible(true)}
                > 
                    <Icon name='food' />                       
                    Show Menu                   
                </div>
            </div>
        )        
    }

    const selectedFilter = (e,data) => {
        setFilterBy(data.value)
    }

    const ReactGoogleMaps = (
        <GoogleMapReact
            ref ={Map}
            defaultCenter={{
                lat: 1.28967,
                lng: 103.85007
            }}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({map, maps}) => mapsLoaded(map, maps)}
            defaultZoom={12}
            onChildClick ={_onChildClick}
        >            
            {
                showMarkers &&  MyMarker()                
            }    
        </GoogleMapReact>
    )

    return(
        <div style={{ height:`${window.innerHeight-100}px`, width: '100%' }}>
            {
                loading 
                    ? <Loader/> 
                    :   <>                           
                            <Segment>
                            <Dropdown
                                placeholder='Filter Restaurants'
                                fluid
                                selection
                                options={restaurantCategories}
                                onChange = {selectedFilter}
                                value = {filterBy}
                            />
                            </Segment>  
                            <div style={{ height:`${window.innerHeight-100}px`, width: '100%' }}> 
                            <Sidebar.Pushable > 
                                <Sidebar
                                    //as={Menu}
                                    animation='slide along'
                                    direction='right'
                                    icon='labeled'
                                    onHide={ () => setSideBarVisible(false)}
                                    vertical
                                    visible={sideBarVisible}
                                    width='wide'
                                >
                                    <div
                                        style={{padding:'8px'}}
                                    >
                                        <SideBarClose
                                            name='close'
                                            title="Close"
                                            onClick={ () => setSideBarVisible(false)}
                                        />
                                        <h5
                                            style={{
                                                top: '-25px',
                                                position: 'relative',
                                                width : '200px'
                                            }}
                                        > 
                                            Our Delicious Menu
                                        </h5>
                                        <div
                                            style={{padding:'15px'}}
                                        >
                                            <h5>Starters</h5>
                                            <List>
                                                <List.Item>Tomato Soup</List.Item>
                                                <List.Item>Corn Soup</List.Item>
                                                <List.Item>Cheese Toast</List.Item>
                                            </List>

                                            <h5>Ice Creams</h5>
                                            <List>
                                                <List.Item>Vanilla</List.Item>
                                                <List.Item>Chocolate</List.Item>
                                                <List.Item>Roaste Almonds</List.Item>
                                            </List>

                                        </div>
                                    </div>
                                    </Sidebar> 
                                <Sidebar.Pusher dimmed={sideBarVisible}>       
                                    <div style={{ height:`${window.innerHeight-100}px`, width: '100%' }}>
                                        {ReactGoogleMaps}
                                    </div>
                                </Sidebar.Pusher>
                            </Sidebar.Pushable>
                            </div>
                            {
                                showError && <p>{ERROR_TEXT}</p>
                            }
                        </>
            }
        </div>
    )
}

export default GoogleMap;