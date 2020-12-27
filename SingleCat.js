import React, { Component } from 'react';
import { View, ScrollView, Text, Dimensions, FlatList,
    Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import { NavigationContext } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

import SkeletonView from './SkeletonView';
import Item from '../../NewsFeed/Recommend/Recommend';

const { width } = Dimensions.get('window');

class SingleCat extends Component {
    static contextType = NavigationContext;
    state = {
        catId: null,
        subCatId: null,
        filterModal: false,
        exploreCategory: null,
        complete: false,
        order: 1,
        catModal: false,
        subcatIndex: 0
    }

    // UNSAFE_componentWillMount(){
    //     const {route} = this.props;
    //     const {name} = route.params;
    //     this.setState({selectedCat: name});
    //     // console.log(name);
    // }

    componentDidMount = async() => {
        const { route } = this.props;
        const { catId } = route.params;
        // this.setState({catId: catId});
        
        try {
            const subCat = await AsyncStorage.getItem('subCat');
            if(subCat){
                this.setState({catId: catId,subCatId: subCat});
                const category = await axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    {
                        query:`
                           query{
                            exploreCategory(category:"${catId}", order:${this.state.order}, subCategory:"${subCat}"){
                                categories{
                                  _id
                                  name
                                  logo
                                }
                                subCategories{
                                  _id
                                  name
                                }
                                products{
                                  _id
                                  coverImage
                                  price
                                  title
                                  offer
                                }
                              } 
                           }
                        `
                    }
                );
                this.setState({
                    exploreCategory: category.data.data.exploreCategory,
                    complete: true
                });
                // console.log(category);
            }else{
                const category = await axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    {
                        query:`
                           query{
                            exploreCategory(category:"${catId}", order:${this.state.order}){
                                categories{
                                  _id
                                  name
                                  logo
                                }
                                subCategories{
                                  _id
                                  name
                                }
                                products{
                                  _id
                                  coverImage
                                  price
                                  title
                                  offer
                                }
                              } 
                           }
                        `
                    }
                );
                this.setState({
                    exploreCategory: category.data.data.exploreCategory,
                    complete: true
                });
                // console.log(category);
            }            
        } catch (error) {
            throw error;
        }
    }

    componentDidUpdate = async() => {
        const { route } = this.props;
        const { catId } = route.params;
        // console.log('main cat id', catId);
        
        if(catId !== this.state.catId){
            const subCat = await AsyncStorage.getItem('subCat');
            if(this.state.complete){
                this.setState({
                    complete: false,
                    catId: catId,
                    subCatId: subCat
                });
            }
            try {
                if(subCat){
                    const category = await axios.post(
                        'https://duyel2.herokuapp.com/graphql',
                        {
                            query:`
                            query{
                                exploreCategory(category:"${catId}", order:${this.state.order}, subCategory:"${subCat}"){
                                    categories{
                                        _id
                                        name
                                        logo
                                    }
                                    subCategories{
                                        _id
                                        name
                                    }
                                    products{
                                        _id
                                        coverImage
                                        price
                                        title
                                        offer
                                    }
                                } 
                            }
                            `
                        }
                    );
                    this.setState({
                        exploreCategory: category.data.data.exploreCategory,
                        complete: true
                    });
                    // console.log(category);
                }else{
                    const category = await axios.post(
                        'https://duyel2.herokuapp.com/graphql',
                        {
                            query:`
                            query{
                                exploreCategory(category:"${catId}", order:${this.state.order}){
                                    categories{
                                        _id
                                        name
                                        logo
                                    }
                                    subCategories{
                                        _id
                                        name
                                    }
                                    products{
                                        _id
                                        coverImage
                                        price
                                        title
                                        offer
                                    }
                                } 
                            }
                            `
                        }
                    );
                    this.setState({
                        exploreCategory: category.data.data.exploreCategory,
                        complete: true
                    });
                    // console.log(category);
                }
                
            } catch (error) {
                throw error;
            }
        }
    }

    catUpdatehandler = async(id) => {
        try {
         this.setState({
             // catModal: !this.state.catModal,
             catId: id,
             catModal: false,
             complete: false
         });
         const category = await axios.post(
            'https://duyel2.herokuapp.com/graphql',
             {
                 query:`
                    query{
                     exploreCategory(category:"${id}", order:${this.state.order}){
                         categories{
                           _id
                           name
                           logo
                         }
                         subCategories{
                           _id
                           name
                         }
                         products{
                           _id
                           coverImage
                           price
                           title
                           offer
                         }
                       } 
                    }
                 `
             }
         );
         this.setState({
             exploreCategory: category.data.data.exploreCategory,
             complete: true
         });
        } catch (error) {
            throw error;
        }
    }

    allProducts = async() => {
        try {
            await AsyncStorage.removeItem('subCat')
            this.setState({complete: false, subCatId: null});
            
            const category = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                       query{
                        exploreCategory(category:"${this.state.catId}", order:${this.state.order}){
                            categories{
                              _id
                              name
                              logo
                            }
                            subCategories{
                              _id
                              name
                            }
                            products{
                              _id
                              coverImage
                              price
                              title
                              offer
                            }
                          } 
                       }
                    `
                }
            );
            this.setState({
                exploreCategory: category.data.data.exploreCategory,
                complete: true
            });
            // console.log(category);
        } catch (error) {
            throw error;
        }
    }

    subCatUpdateHandler = async(id) =>{
        try {
            await AsyncStorage.setItem("subCat", id);
            this.setState({subCatId: id});
            const category = await axios.post(
                'https://duyel2.herokuapp.com/graphql',
                {
                    query:`
                       query{
                        exploreCategory(category:"${this.state.catId}", order:${this.state.order}, subCategory:"${id}"){
                            categories{
                              _id
                              name
                              logo
                            }
                            subCategories{
                              _id
                              name
                            }
                            products{
                              _id
                              coverImage
                              price
                              title
                              offer
                            }
                          } 
                       }
                    `
                }
            );
            this.setState({
                exploreCategory: category.data.data.exploreCategory,
                complete: true
            });
        } catch (error) {
            throw error;
        }
    };

    lowToHighHandler = async() =>{
        try {
            const subCat = await AsyncStorage.getItem('subCat');
               this.setState({
                   order: 1,
                   filterModal: false,
                   complete: false,
                   subCatId: subCat
               });
            //    console.log("Low to high", this.state.order);
               if(subCat){
                const category = await axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    {
                        query:`
                           query{
                            exploreCategory(category:"${this.state.catId}", order:1, subCategory:"${subCat}"){
                                categories{
                                  _id
                                  name
                                  logo
                                }
                                subCategories{
                                  _id
                                  name
                                }
                                products{
                                  _id
                                  coverImage
                                  price
                                  title
                                  offer
                                }
                              } 
                           }
                        `
                    }
                );
                this.setState({
                    exploreCategory: category.data.data.exploreCategory,
                    complete: true
                });
            }else{
                const category = await axios.post(
                    'https://duyel2.herokuapp.com/graphql',
                    {
                        query:`
                           query{
                            exploreCategory(category:"${this.state.catId}", order:1){
                                categories{
                                  _id
                                  name
                                  logo
                                }
                                subCategories{
                                  _id
                                  name
                                }
                                products{
                                  _id
                                  coverImage
                                  price
                                  title
                                  offer
                                }
                              } 
                           }
                        `
                    }
                );
                this.setState({
                    exploreCategory: category.data.data.exploreCategory,
                    complete: true
                });
            }
        } catch (error) {
            throw error;
        }
    }

    highToLowHandler = async() =>{
        try {
            const subCat = await AsyncStorage.getItem('subCat');
                this.setState({
                    order: -1,
                    filterModal: false,
                    complete: false,
                    subCatId: subCat
                });
                // console.log("High to low", this.state.order);
                if(subCat){
                    const category = await axios.post(
                        'https://duyel2.herokuapp.com/graphql',
                        {
                            query:`
                               query{
                                exploreCategory(category:"${this.state.catId}", order: -1, subCategory:"${subCat}"){
                                    categories{
                                      _id
                                      name
                                      logo
                                    }
                                    subCategories{
                                      _id
                                      name
                                    }
                                    products{
                                      _id
                                      coverImage
                                      price
                                      title
                                      offer
                                    }
                                  } 
                               }
                            `
                        }
                    );
                    this.setState({
                        exploreCategory: category.data.data.exploreCategory,
                        complete: true
                    });
                }else{
                    const category = await axios.post(
                        'https://duyel2.herokuapp.com/graphql',
                        {
                            query:`
                               query{
                                exploreCategory(category:"${this.state.catId}", order:-1){
                                    categories{
                                      _id
                                      name
                                      logo
                                    }
                                    subCategories{
                                      _id
                                      name
                                    }
                                    products{
                                      _id
                                      coverImage
                                      price
                                      title
                                      offer
                                    }
                                  } 
                               }
                            `
                        }
                    );
                    this.setState({
                        exploreCategory: category.data.data.exploreCategory,
                        complete: true
                    });
                }
        } catch (error) {
            throw error;
        }
    }

    async removeSubCat(){
        await AsyncStorage.removeItem('subCat');
    }

    subCatScll(index){
        let previous = this.state.subcatIndex;
        this.setState({subcatIndex: index});
        if(index > previous){
            this.scroll.scrollToEnd({x: index * width, y: 0, animated: true})
        } else if(index < previous){
            this.scroll.scrollTo({x: 0, y: index * width, animated: true})
        }
    }

    render(){
        const navigation = this.context;
        let categories, subCategories, catMain, body;

        if(this.state.complete){
            catMain = this.state.exploreCategory.categories.map(category => {
                if(this.state.catId === category._id){
                    return(
                        <TouchableWithoutFeedback onPress={() => this.setState({catModal: true})}>
                            <View style={styles.selectedCatSec}>
                                <Text>{category.name}</Text>
                                <Icon name="chevron-down" size={25} />
                            </View>
                        </TouchableWithoutFeedback>
                    )
                } else {
                    return null;
                }
            });

            categories = this.state.exploreCategory.categories.map((item) => (
                <TouchableWithoutFeedback onPress={() => {
                        this.removeSubCat();
                        this.setState({catModal: false});
                        navigation.navigate('SingleCat', {catId: item._id});
                    }}
                >
                    <View style={styles.catSec}>
                        <Avatar.Image
                            size={60}
                            source={{uri: item.logo}}
                        />
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                </TouchableWithoutFeedback>
            ));

            subCategories = this.state.exploreCategory.subCategories.map((item, id) => {
                if(this.state.subCatId === item._id){
                    this.subCatScll.bind(id);
                    return(
                        <Button
                            color="#FFF"
                            uppercase={false}
                            labelStyle={{fontSize: 12}}
                            onPress={() => this.subCatUpdateHandler(item._id)}
                            style={[styles.subCat, {backgroundColor: '#00A77B'}]}
                        >{item.name}</Button>
                    )
                } else {
                    return(
                        <Button
                            color="#000"
                            uppercase={false}
                            labelStyle={{fontSize: 12}}
                            style={[styles.subCat, {backgroundColor: '#FFF'}]}
                            onPress={() => this.subCatUpdateHandler(item._id)}
                        >{item.name}</Button>
                    )
                }
            });

            if(this.state.exploreCategory.products.length > 0){
                body = <View style={{flex: 1}}>
                    <View style={styles.header}>
                        <Icon
                            name="chevron-left"
                            size={30}
                            onPress={() => navigation.goBack()}
                        />
                        {catMain}
                    </View>

                    <FlatList
                        data={this.state.exploreCategory.products}
                        renderItem={({item}) => (
                            <Item
                                id={item._id}
                                name={item.title}
                                price={item.price}
                                offer={item.offer}
                                img={item.coverImage}
                            />
                        )}
                        numColumns={2}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{paddingHorizontal: 10}}
                        ListHeaderComponent={
                            <ScrollView
                                horizontal={true}
                                ref={(node) => this.scroll = node}
                                showsHorizontalScrollIndicator={false}
                                style={styles.subCatContainer}
                            >
                                { 
                                    (this.state.subCatId) ? 
                                    <Button
                                        color="#000"
                                        uppercase={false}
                                        labelStyle={{fontSize: 12}}
                                        onPress={() => this.allProducts()}
                                        style={[styles.allBtn, {backgroundColor: "#FFF"}]}
                                    >All</Button> : 
                                    <Button
                                        color="#FFF"
                                        uppercase={false}
                                        labelStyle={{fontSize: 12}}
                                        onPress={() => this.allProducts()}
                                        style={[styles.allBtn, {backgroundColor: "#00A77B"}]}
                                    >All</Button>
                                }
                                {subCategories}
                            </ScrollView>
                        }
                    />
                    
                    <Button
                        color="#00A77B"
                        style={{backgroundColor: '#FFF'}}
                        onPress={() => this.setState({filterModal: true})}
                    >Filter</Button>

                </View>
            } else{
                body = <View>
                    <View style={styles.header}>
                        <Icon
                            name="chevron-left"
                            size={30}
                            onPress={() => navigation.goBack()}
                        />
                        {catMain}
                    </View>
                    <ScrollView
                        horizontal={true}
                        ref={(node) => this.scroll = node}
                        showsHorizontalScrollIndicator={false}
                        style={styles.subCatContainer}
                    >
                        { 
                            (this.state.subCatId) ? 
                            <Button
                                color="#000"
                                uppercase={false}
                                labelStyle={{fontSize: 12}}
                                onPress={() => this.allProducts()}
                                style={[styles.allBtn, {backgroundColor: "#FFF"}]}
                            >All</Button> : 
                            <Button
                                color="#FFF"
                                uppercase={false}
                                labelStyle={{fontSize: 12}}
                                onPress={() => this.allProducts()}
                                style={[styles.allBtn, {backgroundColor: "#00A77B"}]}
                            >All</Button>
                        }
                        {subCategories}
                    </ScrollView>
                    <View style={styles.emptySec}>
                        <Text style={{fontSize: 16}}>Unfortunately stock out</Text>
                        <Text>Don't worry we will stock in very soon. Be patient and Happy Shopping...</Text>
                        <Button
                            color="#FFF"
                            uppercase={false}
                            style={styles.homeBtn}
                            onPress={() => this.props.navigation.navigate('Home')}
                        >Go to Home</Button>
                    </View>
                </View>
            }

        } else {
            body = <SkeletonView />;
        }

        return(
            <>
                {body}
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.filterModal}
                    onRequestClose={() => this.setState({filterModal: false})}
                >
                    <View style={{backgroundColor: '#000000aa'}}>
                        <Text
                            style={{height: '60%'}}
                            onPress={() => this.setState({filterModal: false})}
                            />
                        <View style={styles.pfContainer}>
                            <View>
                                <Button
                                    color={(this.state.order === 1) ? "#FFF" : "#00A77B"}
                                    style={(this.state.order === 1) ?
                                        [styles.priceFilterBnt,{backgroundColor: "#00A77B"}] :
                                        styles.priceFilterBnt}
                                    onPress={() => this.lowToHighHandler()}
                                >Low to high Price</Button>
                                <Button
                                    color={(this.state.order === -1) ? "#FFF" : "#00A77B"}
                                    style={(this.state.order === -1) ?
                                        [styles.priceFilterBnt,{backgroundColor: "#00A77B"}] :
                                        styles.priceFilterBnt}
                                    onPress={() => this.highToLowHandler()}
                                >High to Low Price</Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={this.state.catModal}
                    onRequestClose={() => this.setState({catModal: false})}
                >
                    <View style={{backgroundColor: '#000000aa'}}>
                        <View style={styles.mcContainer}>
                            <View style={styles.closeSec}>
                                <Icon
                                    name="close"
                                    size={25}
                                    onPress={() => this.setState({catModal: false})}
                                />
                                {/* <Avatar.Icon icon="close" size={30} /> */}
                            </View>
                            <ScrollView contentContainerStyle={styles.modalCatSec}>
                                <View style={styles.modalCategories}>
                                    {categories}
                                </View>
                            </ScrollView>
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

export default connect(mapStateToProps)(SingleCat);

const styles = StyleSheet.create({
    header: {
        height: 50,
        flexDirection: 'row',
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: .5,
        borderBottomColor: '#ccc'
    },
    subCatContainer: {
        marginLeft: 5,
        marginVertical: 15,
        overflow: 'visible'
    },
    selectedCatSec: {
        flex: 1,
        marginLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    btnSec: {
        marginRight: 20,
        justifyContent: 'center',
        borderRadius: 20
    },
    allBtn: {
        marginRight: 10,
        borderRadius: 20
    },
    catSec: {
        width: '45%',
        alignItems: 'center',
        flexDirection: 'column',
        marginVertical: 10
    },
    name: {
        fontSize: 12,
        fontFamily: "Roboto-Regular"
    },
    subCat: {
        marginHorizontal: 10,
        borderRadius: 20
    },
    pfContainer: {
        padding: 15,
        height: '40%',
        backgroundColor: '#F2F2F2'
    },
    priceFilterBnt: {
        backgroundColor: '#FFF',
        marginVertical: 10
    },
    mcContainer: {
        height: '100%',
        backgroundColor: '#F2F2F2'
    },
    closeSec: {
        alignItems: 'flex-end',
        margin: 10
    },
    modalCatSec: {
        flex: 1,
        justifyContent: 'center'
    },
    modalCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: 10
    },
    emptySec: {
        paddingHorizontal: 10,
        alignItems: 'center',
        marginTop: 50
    },
    homeBtn: {
        marginTop: 10,
        backgroundColor: "#00A77B"
    }
});