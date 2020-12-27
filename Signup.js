import React, { Component } from 'react';
import { RadioButton, Button } from 'react-native-paper';
import { View, Text, TextInput, ScrollView, TouchableWithoutFeedback,
    Keyboard, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

import * as actionTypes from '../../../store/actions/actionTypes';

class Signup extends Component {
    state = {
        name: '',
        phone: null,
        pass: '',
        gender: 'male',
        seePass: false,
        loading: false,
        validate: true
    }
    signUpHandler = async() =>{
        try {
            this.setState({loading: true})
            const user = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                    mutation{
                        createUser(userInput:
                        {
                            user_name:"${this.state.name}",
                            phone:"+88${this.state.phone}",
                            password:"${this.state.pass}",
                            gender:"${this.state.gender}"
                        }
                        ){
                            success
                            error_message
                            token
                            userId
                            userName
                            phone
                        }
                    }`
                }
            );

            if(user.data.data.createUser.success){
                await AsyncStorage.setItem("TOKEN", user.data.data.createUser.token);
                this.props.signupInfo(user.data.data.createUser);
                this.setState({
                    name: '',
                    phone: null,
                    pass: '',
                    gender: 'male',
                    loading: false
                });
                this.props.navigation.navigate(this.props.user.route);
            } else{
                this.props.signupError(user.data.data.createUser.error_message);
                this.setState({loading: false});
            }
        } catch (error) {
            throw error;
        }
    };

    render(){
        return(
            <>
                <View style={styles.header}>
                    <Icon name="chevron-left" size={30} onPress={() => this.props.navigation.goBack()} />
                    <Text style={styles.titleTxt}>Sign up</Text> 
                </View>
                <ScrollView style={styles.container}>
                    <View style={{marginTop: 20}}>
                        <TextInput
                            placeholder="Enter Name"
                            style={styles.inputName}
                            onChangeText={(text) => this.setState({name: text})}
                        />
                    </View>
                    <View style={styles.phoneSec}>
                        <View style={styles.code}>
                            <Text>+88</Text>
                        </View>
                        <TextInput
                            placeholder="Enter Phone Number"
                            keyboardType="number-pad"
                            style={styles.inputPhone}
                            onChangeText={(text) => this.setState({phone: text})}
                        />
                    </View>
                    {
                        (!this.state.validate) ?
                        <Text style={{color: "#DF205B"}}>Enter Valid Phone Number.</Text> : null
                    }
                    <View style={styles.passSec}>
                        <TextInput
                            placeholder="Password"
                            style={styles.inputPass}
                            secureTextEntry={!this.state.seePass}
                            onChangeText={(text) => this.setState({pass: text})}
                        />
                        {
                            (this.state.pass) ?
                            <View style={styles.seePassSec}>
                                <TouchableWithoutFeedback
                                onPress={() => this.setState(prev => ({seePass: !prev.seePass}))}
                            >
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
                    <View style={styles.genderSection}>
                        <RadioButton.Group
                            value={this.state.gender}
                            onValueChange={value => this.setState({gender: value})}
                        >
                            <RadioButton.Item label="Male" value="male" color="#00A77B" />
                            <RadioButton.Item label="Female" value="female" color="#00A77B" />
                        </RadioButton.Group>
                    </View>
                    { (this.props.user.signup_error) ? 
                        <Text style={styles.errorMsg}>{this.props.user.signup_error}</Text> : null
                    }
                    <Text
                        style={styles.signinBtn}
                        onPress={() => this.props.navigation.navigate('Signin')}
                    >
                        Already have an account? Sign in
                    </Text>

                    <Button
                        color="#FFF"
                        uppercase={false}
                        disabled={
                            (this.state.name === "" || this.state.phone === null || this.state.pass === "") ?
                            true : false
                        }
                        style={styles.createAccountBtn}
                        onPress={() => (this.state.phone.length === 11 && this.state.phone[0] === '0') ?
                            this.signUpHandler() : this.setState({validate: false})
                        }
                    >Create Account</Button>
                </ScrollView>
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

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = (disptch) => {
    return{
        signupInfo: (data) => {
            disptch({
                type: actionTypes.SIGNUP,
                userId: data.userId,
                phone: data.phone,
                user_name: data.userName
            });
        },
        signupError: (data) => {
            disptch({
                type: actionTypes.SIGNUP_ERROR,
                message: data
            });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);

const styles = StyleSheet.create({
    header: {
        height: 50,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: .5,
        borderBottomColor: '#ccc'
    },
    container: {
        paddingHorizontal: 20
    },
    titleTxt: {
        fontSize: 16,
        marginLeft: 10
    },
    code: {
        paddingHorizontal: 7,
        justifyContent: 'center',
        borderRightWidth: .5,
        borderRightColor: '#cbcbcb'
    },
    passSec: {
        flexDirection: 'row',
        borderWidth: 1,
        marginVertical: 10,
        borderRadius: 5,
        borderColor: "#CBCBCB"
    },
    inputPass: {
        paddingLeft: 10,
        width: '90%'
    },
    seePassSec: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    inputName: {
        marginVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#CBCBCB"
    },
    phoneSec: {
        marginVertical: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#CBCBCB"
    },
    inputPhone: {
        width: '100%',
        paddingLeft: 10
    },
    genderSection: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    createAccountBtn: {
        backgroundColor: "#00A77B",
        marginVertical: 10
    },
    errorMsg: {
        color: "#DF205B",
        marginBottom: 5
    },
    signinBtn: {
        color : "#00A77B",
        textAlign: "center"
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