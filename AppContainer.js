import React, { Component } from 'react';
import axios from 'axios';
import * as actionTypes from '../store/actions/actionTypes';
import { View, ActivityIndicator } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import {
  Provider as PaperProvider, 
  DefaultTheme as PaperDefaultTheme
} from 'react-native-paper';
import { connect } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';

import { DrawerContent } from './DrawerContent';
import { AuthContext } from './context';

import MainTab from './BottomTabs';
import Cart from '../components/Cart/Cart';
import History from '../components/History/History';
import Checkout from '../components/Checkout/Checkout';
import Signin from '../components/UserControl/Signin/Signin';
import Signup from '../components/UserControl/Signup/Signup';
import SingleItem from '../components/SingleItem/SingleItem';
import Settings from '../components/Settings/Settings';
import Support from '../components/Support/Support';
import UserProfile from '../components/UserProfile/UserProfile';
import Privacy from '../components/Privacy/Privacy';
import SingleCat from '../components/Categories/SingleCatView/SingleCat';
import ForgotPass from '../components/UserControl/ForgotPass/ForgotPass';
import Notifications from '../components/Notifications/Notifications';
import ViewOrder from '../components/Orders/ViewOrder/ViewOrder';
import Wishlist from '../components/Wishlist/Wishlist';
import About from '../components/About/About';
import Contact from '../components/Contact/Contact';
import Terms from '../components/Terms/Terms';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

class AppContainer extends Component {
  state = {
    user: null
  }

  componentDidMount = async() =>{
    // SplashScreen.hide();
    NetInfo.fetch().then(state => {
      if(!state.isConnected){
          return alert('You are offline');
        // console.log("Is connected?", state.isConnected);
      }
    });

    try {
      const token = await AsyncStorage.getItem('TOKEN');
      // console.log(token);
      if(token){
          let headers = {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+token
          }
          
          const user = await axios.post(
            'https://duyel2.herokuapp.com/graphql',
            {
              query:`
                query{
                  user{
                    _id
                    user_name
                    phone
                    interests
                    cartTotal
                    newNotifications
                  }
                }
              `
            },
            {"headers": headers}
          );
          this.props.userSetup(user.data.data.user);
      }
    } catch (error) {
        console.log(error);
    }
  }

  render(){
    const CustomDefaultTheme = {
      ...NavigationDefaultTheme,
      ...PaperDefaultTheme,
      colors: {
        ...NavigationDefaultTheme.colors,
        ...PaperDefaultTheme.colors,
        background: '#F2F2F2',
        boxBg: '#FFF',
        text: '#000',
        primary: '#00A77B'
      }
    }

    return (
      <PaperProvider theme={CustomDefaultTheme}>
        {/* <AuthContext.Provider value={authContext}> */}
          <NavigationContainer theme={CustomDefaultTheme}>
            <Drawer.Navigator drawerContent={props => <DrawerContent {...props} user={this.props.user} />}>
              <Drawer.Screen name="HomeDrawer" component={MainTab} />
              <Drawer.Screen name="Wishlist" component={Wishlist} />
              <Drawer.Screen name="History" component={History} />
              <Drawer.Screen name="Settings" component={Settings} />
              <Drawer.Screen name="Support" component={Support} />

              <Stack.Screen name="About" component={About} />
              <Stack.Screen name="Contact" component={Contact} />
              <Stack.Screen name="Cart" component={Cart} />
              <Stack.Screen name="Signin" component={Signin} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="Checkout" component={Checkout} />
              <Stack.Screen name="SingleCat" component={SingleCat} />
              <Stack.Screen name="ViewOrder" component={ViewOrder} />
              <Stack.Screen name="SingleItem" component={SingleItem} />
              <Stack.Screen name="ForgotPass" component={ForgotPass} />
              <Stack.Screen name="Privacy" component={Privacy} />
              <Stack.Screen name="Terms" component={Terms} />
              <Stack.Screen name="UserProfile" component={UserProfile} />
              <Stack.Screen name="Notifications" component={Notifications} />
            </Drawer.Navigator>
          </NavigationContainer>
        {/* </AuthContext.Provider> */}
      </PaperProvider>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch =>{
  return{
    userSetup: (data) =>{
      dispatch({
        type: actionTypes.USER_SETUP,
        userId: data._id,
        phone: data.phone,
        userName: data.user_name,
        cartItems: data.cartTotal,
        interests: data.interests,
        newNotifications: data.newNotifications
      });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);