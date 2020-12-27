import React from 'react';
import { NavigationContext } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback,
    Keyboard, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import axios from 'axios';
import { Button } from 'react-native-paper';

import * as actionTypes from '../../../store/actions/actionTypes';

class Signin extends React.Component {
    static contextType = NavigationContext;    
    state = {
        phone: null,
        password: '',
        seePass: false,
        validate: true,
        loading: false
    }

    signinHandler = async() =>{
        try {
            this.setState({loading: true});
            const user = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                        query{
                            login(phone:"+88${this.state.phone}", password:"${this.state.password}"){
                                success
                                error_message
                                token
                                userId
                                userName
                                phone
                                cartTotal
                                interests
                            }
                        }
                    `
                }
            );
            
            if(user.data.data.login.success){
                await AsyncStorage.setItem("TOKEN", user.data.data.login.token);
                this.props.loginInfo(user.data.data.login);
                this.setState({phone: null, password: '', loading: false});
                this.context.navigate(this.props.user.route);
            } else{
                this.props.loginError(user.data.data.login.error_message);
                this.setState({loading: false});
            }
        }catch (error) {
            throw error;
        }
    }
    
    render(){
        return(
            <>
                <View style={styles.header}>
                    <Icon
                        name="chevron-left"
                        size={30}
                        onPress={() => {
                            Keyboard.dismiss();
                            this.props.navigation.goBack();
                        }}
                    />
                    <Text style={styles.titleTxt}>Log In</Text>
                </View>
                <View style={styles.container}>
                    <View style={styles.phoneSec}>
                        <View style={styles.code}>
                            <Text>+88</Text>
                        </View>
                        <TextInput
                            value={this.state.phone}
                            placeholder="Phone"
                            keyboardType="number-pad"
                            style={styles.inputPhone}
                            onChangeText={(text) => this.setState({phone: text})}
                        />
                    </View>
                    {
                        (!this.state.validate) ?
                        <Text style={styles.error}>Enter Valid Phone Number.</Text> : null
                    }
                    <View style={styles.passSection}>
                        <TextInput
                            value={this.state.password}
                            placeholder="Password"
                            style={styles.inputPass}
                            secureTextEntry={!this.state.seePass}
                            onChangeText={(text) => this.setState({password: text})}
                        />
                        {
                            (this.state.password) ?
                            <View style={styles.seePassSec}>
                                <TouchableWithoutFeedback onPress={() => this.setState(prev => ({seePass: !prev.seePass}))}>
                                    {
                                        (this.state.seePass) ?
                                        <Icon name="eye-outline" size={20} style={{marginRight: 5}} /> :
                                        <Icon name="eye-off-outline" size={20} style={{marginRight: 5}} />
                                    }
                                </TouchableWithoutFeedback>
                            </View> : 
                            null
                        }
                    </View>
                    { (this.props.user.login_error) ? 
                        <Text style={styles.error}>{this.props.user.login_error}</Text> : null
                    }
                    <View style={styles.forgotSection}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Signup')}>
                            <Text style={styles.noAcc}>No account? Sign up</Text>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ForgotPass')}>
                            <Text style={styles.forgotAcc}>Forgot Password?</Text>
                        </TouchableWithoutFeedback>
                    </View>
                    <Button
                        color="#FFF"
                        uppercase={false}
                        style={{backgroundColor: '#00A77B'}}
                        disabled={
                            (this.state.phone === "" || this.state.password === "") ?
                            true : false
                        }
                        onPress={() => (this.state.phone.length === 11 && this.state.phone[0] === '0') ? 
                            this.signinHandler() : this.setState({validate: false})
                        }
                    >Log In</Button>
                </View>
                <Modal
                    transparent={true}
                    animationType={'none'}
                    visible={this.state.loading}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.activityIndicatorWrapper}>
                            <ActivityIndicator
                                size="large"
                                animating={this.state.loading}
                            />
                        </View>
                    </View>
                </Modal>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user
});

const mapDispatchToProps = (disptch) => {
    return{
        loginInfo: (data) => {
            disptch({
                type: actionTypes.LOGIN,
                userId: data.userId,
                phone: data.phone,
                user_name: data.userName,
                cartItems: data.cartTotal,
                interests: data.interests
            });
        },
        loginError: (data) => {
            disptch({
                type: actionTypes.LOGIN_ERROR,
                message: data
            });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);

const styles = StyleSheet.create({
    header: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomWidth: .5,
        borderBottomColor: '#ccc'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginHorizontal: 20
    },
    titleTxt: {
        fontSize: 16,
        marginLeft: 10
    },
    phoneSec: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#CBCBCB"
    },
    code: {
        // width: '15%',
        // alignItems: 'center',
        paddingHorizontal: 7,
        justifyContent: 'center',
        borderRightWidth: .5,
        borderRightColor: '#cbcbcb'
    },
    passSection: {
        marginTop: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#CBCBCB"
    },
    inputPhone: {
        width: '100%',
        paddingLeft: 10
    },
    inputPass: {
        width: '90%',
        paddingLeft: 10,
    },
    seePassSec: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    forgotSection: {
        flexDirection: "row",
        marginVertical: 20,
        justifyContent: "space-between"
    },
    noAcc: {
        fontSize: 12,
        color: "#00A77B"
    },
    forgotAcc: {
        fontSize: 12,
        color: "#00A77B"
    },
    error: {
        color: '#DF205B',
        marginTop: 5
    },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});