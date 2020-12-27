import React, { Component } from 'react';
import { View, ScrollView, Text, TextInput, Modal, Image, Keyboard,
    TouchableWithoutFeedback, StyleSheet, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContext } from '@react-navigation/native';
import { Avatar, Title, Caption, Badge, Button } from 'react-native-paper';
import ImageSlider from 'react-native-image-slider';
import { connect } from 'react-redux';
import axios from 'axios';
import ImageZoom from 'react-native-image-pan-zoom';
import AsyncStorage from '@react-native-community/async-storage';

import SkeletonView from './SkeletonView';
import Search from '../SearchBox/SearchBox';
import RelatedItem from './RelatedItem/Item';
import Description from './Description/Description';

import noReview from '../../assets/img/noReview.png';
import * as actionTypes from '../../store/actions/actionTypes';

class SingleItem extends Component {
    static contextType = NavigationContext;
    state = {
        imgModal: false,
        feedbackModal: false,
        feedbackText: '',
        feedbackId: null,
        isSuperb: false,
        product: {},
        superb: 0,
        feedbacks: [],
        sizeId: 0,
        sizeName: '',
        quantity: 1,
        availQuantity: 0,
        complete: false,
        loading: false
    }

    componentDidMount() {
        const { route } = this.props;
        const { productId } = route.params;

        this.fetchData(productId);
        this.historyHandler(productId);
    }

    componentDidUpdate() {
        const { route } = this.props;
        const { productId } = route.params;

        if(productId !== this.state.product._id){
            if(this.state.complete){
                this.setState({complete: false});
            }
            this.fetchData(productId);
            this.historyHandler(productId);
        }
    }

    fetchData = async(productId) => {
        try {            
            const product = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                    query{
                        product(productId:"${productId}"){
                            _id
                            title
                            images
                            price
                            offer
                            superb
                            description
                            descriptionPoints
                            stock
                            category
                            categoryName
                            subCategory
                            subCategoryName
                            sizes{
                                _id
                                name
                                quantity
                                height
                                width
                            }
                            reviews{
                                _id
                                text
                                date
                                user{
                                    _id
                                    user_name
                                    image
                                }
                            }
                            related{
                                _id
                                title
                                price
                                coverImage
                                offer
                            }
                        }
                    }`
                }
            );
            this.setState({
                product: product.data.data.product,
                superb: product.data.data.product.superb.length,
                feedbacks: product.data.data.product.reviews
            });

            if(this.state.product.sizes.length > 0){
                const sizes = this.state.product.sizes.filter(size =>{
                    return size.quantity > 0
                });
                this.setState({
                    sizeName: sizes[0].name,
                    sizeId:sizes[0]._id,
                    availQuantity:sizes[0].quantity,
                    complete: true
                });
            } else{
                this.setState({
                    availQuantity:product.data.data.product.stock,
                    complete: true
                });
            }

            if(this.state.product.superb.includes(this.props.user.userId)){
                this.setState({isSuperb: true})
            } else {
                this.setState({isSuperb: false})
            }
            // console.log(this.state.product.title);
        } catch(e){
            throw e;
        }
    }

    superbAddHandler = async() => {
        try {
            if(this.props.user.auth){
                this.setState({
                    isSuperb: true,
                    superb: this.state.superb+1
                });

                this.props.addWishlist();
                axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    {
                        query:`
                            mutation{
                                addSuperb(productId:"${this.state.product._id}", userId:"${this.props.user.userId}"){
                                    _id
                                }
                            }
                        `
                    }
                );
            } else{
                this.goLogin();
            }
        } catch (error) {
            throw error;
        }
    };

    superbRemoveHandler = async() => {
        try {
            if(this.props.user.auth){
                this.setState({
                    isSuperb: false,
                    superb: this.state.superb-1
                });

                this.props.removeWishlist();
                axios.post(
                    'https://duyel2.herokuapp.com/graphql', {
                        query:`
                            mutation{
                                removeSuperb(productId:"${this.state.product._id}", userId:"${this.props.user.userId}"){
                                    _id
                                }
                            }
                        `
                    }
                );
            } else {
                this.goLogin();
            }
        } catch (error) {
            throw error;
        }
    };

    cartHandler = async() => {
        try {
            // this.setState({loading: true})
            if(this.props.user.auth){
                this.props.cartAdd(1);
                const cart_data = {
                    query:`
                        mutation{
                            addToCart(cartInput:{
                                productId:"${this.state.product._id}"
                                sizeId:"${this.state.sizeId}"
                                quantity: ${this.state.quantity}
                                size:"${this.state.sizeName}"
                            }, userId:"${this.props.user.userId}"){
                                user_name
                            }
                        }
                    `
                }
                // console.log("Cart Data", cart_data);
                this.setState({
                    availQuantity: this.state.availQuantity - this.state.quantity,
                    loading: false
                });
                const cart =  await axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    cart_data
                );
                // console.log(cart);
            } else {
                this.goLogin();
            }
        } catch (error) {
            throw error;
        }
    };
    
    historyHandler = async(id) => {
        const token = await AsyncStorage.getItem("TOKEN");
        if(token){
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            };
            axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                        mutation{
                            addHistory(productId:"${id}"){
                                _id
                            }
                        }
                    `
                },
                {"headers":headers}
            );
            this.props.addHistory();
        }
    };

    createFeedback = async() => {
        const feedback = await axios.post(
            'https://duyel2.herokuapp.com/graphql',
            {
                query:`
                    mutation{
                        createReview(
                            userId:"${this.props.user.userId}"
                            text:"${this.state.feedbackText}"
                            product:"${this.state.product._id}"
                            ){
                            _id
                            text
                            date
                            user{
                                _id
                                user_name
                                image
                            }
                        }
                    }
                `
            }
        );
       this.setState({
           feedbacks: feedback.data.data.createReview,
           feedbackModal: false,
           feedbackText: ''
       });
    }

    updateFeedbackHandler = async() => {
        try {
            const updateReview = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
               {
                   query:`
                      mutation{
                          updateReview(reviewId:"${this.state.feedbackId}", userId:"${this.props.user.userId}", newText:"${this.state.feedbackText}"){
                            _id
                            text
                            date
                            user{
                              _id
                              user_name
                              image
                            }
                          }
                      }
                   `
               }
            );
            this.setState({
                feedbacks: updateReview.data.data.updateReview,
                feedbackModal: false,
                feedbackText: ''
            });
        } catch (error) {
            throw error;
        }
    };

    deleteFeedbackHandler = async(delId, reviewId) =>{
        try {
            const feedbacksall = this.state.feedbacks.filter((porduct, id) =>{
                return delId !== id;
            });
            this.setState({
                feedbacks: feedbacksall
            });
            axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                        mutation{
                            deleteReview(reviewId:"${reviewId}", userId:"${this.props.user.userId}"){
                                _id
                            }
                        }
                    `  
                }
            )
        } catch (error) {
            throw error;
        }
    }

    quantityHandler = (q) => {
        this.setState({
           quantity: q
        });
    };

    sizeHandler = (name, id, q) => {
        this.setState({
           sizeName: name,
           sizeId: id,
           availQuantity: q,
           quantity: 1
        });
    }

    mainCatHandler = async(id) => {
        await AsyncStorage.removeItem('subCat');
        this.context.navigate('SingleCat', {catId: id});
    }

    subCatHandler = async(catId, subCatId) => {
        await AsyncStorage.setItem('subCat', subCatId);
        this.context.navigate('SingleCat', {catId: catId});
    }

    goLogin(){
        this.props.setRoute();
        this.context.navigate('Signin');
    }

    render(){
        const navigation = this.context;
        let reviews, relatedProducts, sizes, availQuantity = [], body;
        let offPrice = Math.ceil(this.state.product.price - (this.state.product.price*this.state.product.offer/100));
        
        if(this.state.complete){
            if(this.state.product.sizes.length > 0){
                let sizeStyle;
                let allSizes = this.state.product.sizes.map((size, id) =>{
                    sizeStyle = this.state.sizeId === size._id ?
                        sizeStyle = styles.selectedSizeQty : styles.sizeQty;
                    
                    if(size.quantity> 0){
                        return(
                            <TouchableWithoutFeedback
                                onPress={() => this.sizeHandler(size.name, size._id, size.quantity) }
                            >
                                <Avatar.Text
                                    size={50}
                                    key={size._id}
                                    label={size.name}
                                    labelStyle={{fontSize: 16}}
                                    style={sizeStyle}
                                />
                            </TouchableWithoutFeedback>
                        );
                    } else{
                        return null;
                    }
                });
                sizes = <View style={{marginVertical: 5}}>
                    <Text>Select Size</Text>
                    <ScrollView
                        horizontal={true}
                        style={styles.sizeQtySec}
                        showsHorizontalScrollIndicator={false}
                    >
                        {allSizes}
                    </ScrollView>
                </View>
            }

            let qtyStyle;
            for(let i = 1; i <= this.state.availQuantity; i++){
                qtyStyle = this.state.quantity === i ? styles.selectedSizeQty : styles.sizeQty; 
                availQuantity.push(
                    <TouchableWithoutFeedback
                        onPress={() => this.quantityHandler(i)}
                    >
                        <Avatar.Text
                            size={50}
                            label={i}
                            style={qtyStyle}
                            labelStyle={{fontSize: 16}}
                        />
                    </TouchableWithoutFeedback>
                )
            }

            reviews = this.state.feedbacks.map((item, id) => (
                <View style={{marginVertical: 5}}>
                    <View style={styles.profileSec}>
                        <TouchableWithoutFeedback
                            onPress={() => navigation.navigate('UserProfile', {userId: item.user._id})}
                        >
                            <View style={styles.profile}>
                                <Avatar.Text
                                    size={45}
                                    label={item.user.user_name[0].toUpperCase()}
                                    style={{backgroundColor: '#00A77B'}}
                                />
                                <View style={{marginLeft: 10}}>
                                    <Text style={{fontSize: 14}}>
                                        {item.user.user_name[0].toUpperCase() + item.user.user_name.slice(1)}
                                    </Text>
                                    <Caption>{item.date.split("T")[0]}</Caption>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        {
                            (item.user._id === this.props.user.userId) ? 
                            <View style={styles.feedbackEditSec}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({
                                        feedbackModal: true,
                                        feedbackText: item.text,
                                        feedbackId: item._id
                                    })}
                                >
                                    <Icon
                                        name="pencil"
                                        size={20}
                                        style={{marginRight: 10}}
                                    />
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        Alert.alert(
                                            "Delete Feedback",
                                            "Are you sure delete this feedback?",
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Delete",
                                                    onPress: () => this.deleteFeedbackHandler(id, item._id)
                                                }
                                            ],
                                            { cancelable: true }
                                        )
                                    }
                                >
                                    <Icon name="delete" size={20} />
                                </TouchableWithoutFeedback>
                            </View> : null
                        }
                    </View>
                    <Text style={{marginVertical: 5}}>{item.text}</Text>
                </View>
            ));

            relatedProducts = this.state.product.related.map(item => {
                if(this.state.product._id !== item._id){
                    return(
                        <RelatedItem
                            key={item._id}
                            id={item._id}
                            name={item.title}
                            price={item.price}
                            offer={item.offer}
                            img={item.coverImage}
                        />
                    )
                } else{
                    return null;
                }
            });

            body = <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Icon
                            name="chevron-left"
                            size={30}
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={{marginLeft: 5}}>
                            {(this.state.product.title.length > 30) ? 
                                this.state.product.title.substring(0, 29) + '...' :
                                this.state.product.title
                            }
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Search />
                        <TouchableWithoutFeedback
                            onPress={() => navigation.navigate('Cart')}
                        >
                            <View>
                                <Icon
                                    name="cart"
                                    size={25}
                                    color="#959595"
                                    style={{marginLeft: 15}}
                                />
                                <Badge
                                    size={15}
                                    style={styles.badge}
                                >
                                    {this.props.user.cartItems}
                                </Badge>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
    
                <ScrollView
                    nestedScrollEnabled={true}
                >
                    <ImageSlider
                        loopBothSides
                        autoPlayWithInterval={3000}
                        images={this.state.product.images}
                        style={styles.slider}
                        customSlide={({ index, item, style, width }) => (
                            // It's important to put style here because it's got offset inside
                            <TouchableWithoutFeedback
                                onPress={() => this.setState({imgModal: true})}
                            >
                                <View key={index} style={[style]}>
                                    <Image
                                        source={{uri: item}}
                                        resizeMethod="resize"
                                        resizeMode="contain"
                                        style={styles.customImage}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    />
    
                    <View style={styles.specSec}>
                        <Text style={styles.category}>
                            <Text
                                onPress={() => this.mainCatHandler(this.state.product.category)}
                            >
                                {this.state.product.categoryName}
                            </Text> {' / '} 
                            <Text
                                onPress={() =>
                                    this.subCatHandler(this.state.product.category, this.state.product.subCategory)
                                }
                            >
                                {this.state.product.subCategoryName}
                            </Text>
                        </Text>
                        <View>
                            <Text style={styles.itemName}>{this.state.product.title}</Text>
                            { (this.state.product.offer) ? 
                                <View style={{marginVertical: 5}}>
                                    <Text style={styles.price}>Price: 
                                        <Icon name="currency-bdt" size={15} />{offPrice} 
                                        <Text
                                            style={styles.oldPrice}
                                        > <Icon name="currency-bdt" size={15} />{this.state.product.price}
                                        </Text> {this.state.product.offer}% OFF
                                    </Text>
                                    <Text
                                        style={{fontSize: 12}}
                                    >
                                        Your Save <Icon name="currency-bdt" size={12} />
                                        {this.state.product.price - offPrice}
                                    </Text>
                                </View> : 
                                <Text
                                    style={styles.price}
                                >
                                    Price: <Icon name="currency-bdt" size={15} />
                                    {this.state.product.price}
                                </Text>
                            }
                        </View>
    
                        {sizes}
    
                        {(this.state.availQuantity > 0) ?
                            <View>
                                <Text>Select Quantity</Text>
                                <ScrollView
                                    horizontal={true}
                                    style={styles.sizeQtySec}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {availQuantity}
                                </ScrollView>
                            </View> : <Text>Out of Stock</Text>
                        }
    
                        {/* add to cart and wish */}
                        <View style={styles.reactSec}>
                            {
                                (this.state.isSuperb) ?
                                <TouchableWithoutFeedback
                                    onPress={() => this.superbRemoveHandler()}
                                >
                                    <View style={styles.addedWishlistSec}>
                                        <Icon name="heart" size={20} color="#00A77B" />
                                        <Caption style={{color: '#00A77B'}}> {this.state.superb} </Caption>
                                        <Caption style={{color: '#00A77B'}}>Wishlist</Caption>
                                    </View>
                                </TouchableWithoutFeedback>
                                :
                                <TouchableWithoutFeedback
                                    onPress={() => this.superbAddHandler()}
                                >
                                    <View style={styles.addWishlistSec}>
                                        <Icon name="heart-outline" size={20} />
                                        <Caption> {this.state.superb}  </Caption>
                                        <Caption>Wishlist</Caption>
                                    </View>
                                </TouchableWithoutFeedback>
                            }
                            <Button
                                color="#FFF"
                                uppercase={false}
                                style={styles.addCartBtn}
                                disabled={(this.state.availQuantity) ? false : true}
                                onPress={() => {
                                    this.setState({loading: true});
                                    this.cartHandler();
                                }}
                            >Add to Bag</Button>
                        </View>
    
                        <Description
                            key={this.state.product._id}
                            description={this.state.product.description}
                            descList={this.state.product.descriptionPoints}
                        />
    
                        {/* reviews */}
                        <View>
                            <Title style={{fontSize: 14}}>Customers Feedback</Title>
                            <View style={styles.feedbackBtnSec}>
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        navigation.navigate('UserProfile', {userId: this.props.user.userId})
                                    }
                                >
                                    <Avatar.Text
                                        label={(this.props.user.user_name) ? 
                                            this.props.user.user_name[0].toUpperCase() : 
                                            <Icon name="account" size={30} />
                                        }
                                        size={45}
                                        style={{backgroundColor: '#37C4EE'}}
                                    />
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        (this.props.user.auth) ?
                                        this.setState({feedbackModal: true}) :
                                        this.goLogin();
                                    }}
                                >
                                    <View style={styles.feedbackBtn}>
                                        <Caption>Write a feedback</Caption>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            {(reviews.length > 0) ?
                                reviews :
                                <View style={styles.emptyFeedbackSec}>
                                    <Image
                                        source={noReview}
                                        resizeMethod="resize"
                                        style={styles.emptyFbImg}
                                    />
                                    <Text>No Feedbacks Yet!</Text>
                                </View>
                            }
                        </View>
    
                        {/* related */}
                        <View style={{marginBottom: 10}}>
                            <Title style={{fontSize: 16}}>Related Products</Title>
                            <ScrollView
                                horizontal={true}
                                style={{overflow: 'visible'}}
                                showsHorizontalScrollIndicator={false}
                            >
                                {relatedProducts}
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>                
    
                <Modal
                    animationType= 'slide'
                    visible={this.state.imgModal}
                    onRequestClose={() => this.setState({imgModal: false})}
                >
                    <View style={{flex: 1}}>
                        <View style={styles.closeSec}>
                            <Icon
                                name="close"
                                size={20}
                                onPress={() => this.setState({imgModal: false})}
                            />
                        </View>
                        <ImageSlider
                            loopBothSides
                            autoPlayWithInterval={3000}
                            images={this.state.product.images}
                            customSlide={({ index, item, style, width }) => (
                                // It's important to put style here because it's got offset inside
                                <View key={index} style={[style, styles.customSlide]}>
                                    <ImageZoom
                                        cropWidth={Dimensions.get('window').width}
                                        cropHeight={Dimensions.get('window').height}
                                        imageWidth={Dimensions.get('window').width}
                                        imageHeight={Dimensions.get('window').height}
                                    >
                                        <Image
                                            source={{uri: item}}
                                            resizeMethod="resize"
                                            resizeMode="contain"
                                            style={styles.customImage}
                                        />
                                    </ImageZoom>
                                </View> 
                            )}
                        />
                    </View>
                </Modal>

                <Modal
                    transparent={true}
                    animationType= 'fade'
                    visible={this.state.feedbackModal}
                    onRequestClose={() => this.setState({
                        feedbackModal: false,
                        feedbackText: '',
                        feedbackId: null
                    })}
                >
                    <View style={{backgroundColor: '#000000aa'}}>
                        <Text
                            style={{height: '50%'}}
                            onPress={() => this.setState({
                                feedbackModal: false,
                                feedbackText: '',
                                feedbackId: null
                            })}
                        />
                        <ScrollView style={styles.feedbackModalContainer}>
                            <View style={styles.modalHeaderSec}>
                                <Avatar.Text
                                    label={(this.props.user.user_name) ?
                                        this.props.user.user_name[0].toUpperCase() : null
                                    }
                                    size={45} color="#fff"
                                    style={{backgroundColor: '#00A77B'}}
                                />
                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        this.setState({
                                            feedbackModal: false,
                                            feedbackText: '',
                                            feedbackId: null
                                        });
                                    }}
                                >
                                    <Avatar.Icon
                                        icon="close"
                                        color="#000"
                                        size={35}
                                        style={{backgroundColor: '#ccc'}}
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                            <TextInput
                                value={this.state.feedbackText}
                                placeholder="Write a feedback"
                                style={styles.inputFeedback}
                                multiline={true}
                                numberOfLines={6}
                                autoFocus={true}
                                onChangeText={text => this.setState({feedbackText: text})}
                            />
                            <View style={styles.addFeedbackBtnSec}>
                                { (this.state.feedbackId) ? 
                                    <Button
                                        color="#FFF"
                                        uppercase={false}
                                        style={styles.addFeedbackBtn}
                                        disabled={(this.state.feedbackText) ? false : true}
                                        onPress={() => this.updateFeedbackHandler()}
                                    >Update feedback</Button> : 
                                    <Button
                                        color="#FFF"
                                        uppercase={false}
                                        disabled={(this.state.feedbackText) ? false : true}
                                        style={styles.addFeedbackBtn}
                                        onPress={() => this.createFeedback()}
                                    >Feedback</Button>
                                }
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
                <Modal
                    transparent={true}
                    animationType={'none'}
                    visible={this.state.loading}
                >
                    <View style={styles.activityModalBackground}>
                        <View style={styles.activityIndicatorWrapper}>
                            <Text>Added to Bag</Text>
                        </View>
                    </View>
                </Modal>
            </View>
        } else{
           body = <SkeletonView />
        }

        return(
            <>
                {body}
            </>
        );
    }
}
const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => {
    return{
        cartAdd: (data) => {
            dispatch({
                type: actionTypes.ADD_ITEM,
                item: data
            });
        },
        addWishlist: () => {
            dispatch({
                type: actionTypes.ADD_WISHLIST
            });
        },
        removeWishlist: () => {
            dispatch({
                type: actionTypes.REMOVE_WISHLIST
            });
        },
        addHistory: () => {
            dispatch({
                type: actionTypes.ADD_HISTORY
            });
        },
        setRoute: () => {
            dispatch({
                type: actionTypes.SET_ROUTE,
                route: "SingleItem"
            });
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleItem);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F2F2F2'
    },
    header: {
        height: 50,
        paddingHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        justifyContent: 'space-between',
        borderBottomWidth: .5,
        borderBottomColor: '#ccc',
        elevation: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerRight: {
        flexDirection: 'row',
        marginRight: 10
    },
    badge: { 
        right: -3,
        position: 'absolute',
        backgroundColor: '#00A77B'
    },
    slider: {
        height: 350,
        backgroundColor: '#FFF'
    },
    category: {
        marginBottom: 5,
        color: '#00A77B'
    },
    itemName: {
        fontSize: 14,
        color: '#000',
        marginBottom: 5
    },
    specSec: {
        marginHorizontal: 15,
        marginVertical: 10
    },
    sizeQtySec: {
        overflow: 'visible',
        marginVertical: 5
    },
    sizeQty: {
        marginHorizontal: 5,
        backgroundColor: '#FFF'
    },
    selectedSizeQty: {
        marginHorizontal: 5,
        backgroundColor: '#00A77B'
    },
    reactSec: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    addWishlistSec: {
        width: '40%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: .5,
        borderColor: '#ccc',
        justifyContent: 'center',
        borderRadius: 5
    },
    addedWishlistSec: {
        width: '40%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: .5,
        borderColor: '#00A77B',
        borderRadius: 5
    },
    addCartBtn: {
        width: '55%',
        backgroundColor: '#00A77B'
    },
    price: {
        fontSize: 14,
        color: '#00A77B'
    },
    oldPrice: {
        color: '#CCC',
        textDecorationLine: 'line-through'
    },
    profileSec: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    profile: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    feedbackBtnSec: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 10
    },
    feedbackBtn: {
        width: '80%',
        marginLeft: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    feedbackEditSec: {
        flexDirection: 'row',
        width: '20%'
    },
    feedbackModalContainer: {
        height: '50%',
        backgroundColor: '#fff',
        paddingHorizontal: 15
    },
    emptyFeedbackSec: {
        backgroundColor: '#FFF',
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 5
    },
    emptyFbImg: {
        width: 200,
        height:150,
        resizeMode: 'contain'
    },
    modalHeaderSec: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    inputFeedback: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        textAlignVertical: 'top'
    },
    addFeedbackBtnSec: {
        flexDirection: 'row-reverse',
        marginVertical: 10
    },
    addFeedbackBtn: {
        backgroundColor: '#00A77B'
    },
    customSlide: {
      backgroundColor: '#fff',
    //   justifyContent: 'center',
    },
    closeSec: {
        alignItems: 'flex-end',
        margin: 10
    },
    customImage: {
      width: '100%',
      height: '100%'
    },
    activityModalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 100,
        width: 150,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});