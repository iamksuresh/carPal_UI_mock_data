// import React, { useState , useEffect, createContext} from 'react';


// export const AppContext = createContext()

// export const FavouriteContextProvider = (props) => {

//     const [favouritesList,setFavouritesList] = useState('Akashcontext')
    
//     useEffect( ()=>{
//         console.log('Context api ', favouritesList)
//     },[favouritesList])

//     return(
//         <AppContext.Provider value={favouritesList}>
//             {props.children}
//         </AppContext.Provider>
//     )
// }

//export default FavouriteContextProvider;

import React, {createContext, useContext, useReducer} from 'react';

export const StateContext = createContext();

export const StateProvider = ({reducer, initialState, children}) =>(
    <StateContext.Provider value={useReducer(reducer, initialState)}>        
      {children}
    </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);
