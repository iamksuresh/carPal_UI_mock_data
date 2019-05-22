import React, { useEffect,useState, useReducer  } from 'react';
import { 
    Container,
    Grid,
    Segment,
    List, 
    Image,
    Card,
    Icon,
    Rating,
    TextArea,
    Button
} from 'semantic-ui-react'
import Styled from 'styled-components'
import Api from '../../Api'
import Loader from '../utils/Loader'
import { useStateValue } from '../FavouriteContext'

const FavouriteRestaurants = (props) => {

    const [loading, setLoading] = useState(false)
    const [favouritesList,setFavouritesList] = useState([])
    const [showNotes,setShowNotes] = useState({})
    const [userNotes,setUserNotes] = useState({})
    const [state, dispatch] = useStateValue();    
    const [showError ,setShowError] = useState(false)
    const ERROR_TEXT = 'Error in loading Api data'

    useEffect(()=>{
        if(state && state.favouritesList){
            setFavouritesList(state.favouritesList)
        }
    },[state])
      
    useEffect( ()=>{
        /* Fetch restaurants on map load */
        setLoading(true)
        Api.Get('favourites')
            .then(resp => {
                dispatch({
                    type: 'update',
                    favouritesList: resp
                }) 
                setLoading(false)        
            },err => {
                setLoading(false)
                setShowError(true)
            })
    },[])

    const updateNotes = (val,data) => {
        let x = {}
        x[data.id] = {
            ...data.currobj,
            'notes' : data.value
        }
        setUserNotes({
            ...userNotes,
            ...x
        })

    }

    const addNotes = (val) => {
        let key = val.currentTarget.id
        let obj = {
            ...showNotes
        }
        obj[key] = true
        setShowNotes({
            ...obj,
        })
    }

    const saveNotes = (e,data) => {        
        let updateFavouriteObj = {
            ...userNotes[data.id],
            forUpdate : true
        } ,
            tempUserNotes = userNotes,
            tempshowNotes = showNotes

        Api.PUT('favourites', updateFavouriteObj)
            .then(resp=> {
                //setFavouritesList(resp.data.result)
                delete tempUserNotes[data.id]
                setUserNotes({
                    ...tempUserNotes,
                })
                delete tempshowNotes[data.id]
                setShowNotes({
                    ...tempshowNotes,
                })

                dispatch({
                    type: 'update',
                    favouritesList: resp
                })
            })
    }

    const removeFromList = (e,data) => {
        e.stopPropagation()
        dispatch({
            type: 'mapnormal',
            restaurant_id: data.restaurant_id
        })
        Api.DELETE('favourites',data.restaurant_id)
            .then(resp=> {
                //setFavouritesList(resp.data.result)
                dispatch({
                    type: 'update',
                    favouritesList: resp
                })
            })
    }

    const MouseEnter = (e,data) => {   
        dispatch({
            type: 'maphighlight',
            restaurant_id: data.restaurant_id
        })
    }

    const showRestaurants = () => {
        return favouritesList.map( val=>{
            return(
                <Segment
                    key={val.id}
                    restaurant_id = {val.id}
                >
                    <List.Item
                        key={val.id}
                        restaurant_id = {val.id}
                        onClick={ (e,data) => MouseEnter(e,data) }
                        style={{cursor: 'pointer'}}
                    >
                                   
                        {
                            val.icon ? 
                                <Image
                                    avatar 
                                    src = {val.icon }
                                    style={{marginRight: '10px'}}                    
                                />
                            : <Icon style={{marginRight: '10px'}} size="large" name='food'/>     
                        }            
                        <List.Content style={{display: 'inline-grid',width:'85%'}}>
                            <List.Header as='h4'>
                                {val.name}
                                <Icon 
                                    style={{float: 'right',cursor : 'pointer',color: '#1a73e8'}}  
                                    title='Remove from the list' 
                                    restaurant_id = {val.id}
                                    onClick = {removeFromList}
                                    name='close'/> 
                            </List.Header>
                            <List.Description>
                                <div> <Rating icon='star' defaultRating={val.rating} maxRating={5} disabled /></div>
                                <p>{val.description}</p>
                                {
                                    !val.notes || val.notes.length === 0 ?
                                        <>
                                        <p 
                                            style={{color: '#1a73e8',cursor:'pointer'}}
                                            id={val.id}                                            
                                            onClick={(data) => addNotes(data)}
                                        >
                                            Add Personal Notes
                                        </p>
                                        {
                                            showNotes[val.id] &&
                                                <>
                                                    <TextArea 
                                                        style={{width:'99%'}} 
                                                        placeholder='Add short description' 
                                                        rows={5}
                                                        id = {val.id}
                                                        currobj = {val}
                                                        onInput={updateNotes}
                                                    />
                                                    <Button.Group floated='right'>
                                                        <Button 
                                                            primary 
                                                            id = {val.id}
                                                            onClick={saveNotes}                                                        
                                                        > Save</Button>
                                                    </Button.Group>                                        
                                                </>
                                        }
                                        </>
                                        : <>
                                            <div>
                                                <h5 style={{display: 'inline-block', marginRight : '5px'}}>Personal Notes : </h5> 
                                                <span>{val.notes}</span> 
                                            </div>
                                            
                                        </>
                                }
                            </List.Description>
                        </List.Content>
                    </List.Item>
                </Segment>
            )
        })
    }

    return(
        <div>
            
            {
                loading 
                ? <Loader/> 
                :   <>  
                    <List>
                        {
                            favouritesList.length > 0
                                ? showRestaurants()
                                :<p> No personal lists yet.. How about adding some restaurants to your favourite's list ? </p>
                        }
                    </List> 
                    {
                        showError && <p>{ERROR_TEXT}</p>
                    }           
                </>
            }
        </div>
    )
}

export default FavouriteRestaurants;