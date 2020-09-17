import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import LoadingImage, { LoadingImageEvent } from '../components/LoadingImage';
import LoadingMediaEvent from '../types/LoadingMediaEvent';

export interface PicsumImage {
    author : string
    download_url : string
    height: number
    id: string
    url : string 
    width: number
}

export interface PhotoMediaLibraryProps {
    navigation : any
}

export interface PhotoMediaLibraryState {
    images: PicsumImage[]
    showImages: boolean,
    loadingTimes: LoadingMediaEvent[],
    sum: number,
    average: number,
    variance: number,
    standardDeviation: number,
    minimum: number,
    maximum: number
}

export default class PhotoMediaLibrary extends Component<PhotoMediaLibraryProps, PhotoMediaLibraryState> {
    startTime : number
    endTime : number
    nextPageForPreloading : PicsumImage[]
    currentPage : number
    unsubscribeFocusListener: () => void
    
    constructor(props : PhotoMediaLibraryProps) {
        super(props);
        this.loadMore = this.loadMore.bind(this);

        this.state = {
            images : [],
            showImages: false,
            loadingTimes: [],
            sum: 0,
            average: 0,
            variance: 0,
            standardDeviation: 0,
            minimum: 0,
            maximum: 0
        }

        this.startTime = 0;
        this.endTime = 0;
        this.currentPage = 0;
        this.nextPageForPreloading = [];
        this.unsubscribeFocusListener = () => {};

    }

    componentWillUnmount() {
        this.unsubscribeFocusListener();
    }

    componentDidMount() {
        let { navigation } = this.props;
        this.unsubscribeFocusListener  = navigation.addListener('focus', this.focusPage.bind(this));
        // fetch(`https://picsum.photos/v2/list?page=${this.currentPage}&limit=20`).then(res => res.json()).then((result : PicsumImage[]) => {
        //     this.nextPageForPreloading = result;
        //     console.log("for preload")
        //     FastImage.preload(this.nextPageForPreloading.map(r => {return { uri : r.download_url, priority: FastImage.priority.normal }}));
        //     this.addPreloadedNext();
        // }).catch((err) => {
        //     console.log("error:", err);
        // });
        this.addPreloadedNext();
        console.log("component did mount")
    }

    focusPage() {
        console.log("focus page", this.state.showImages)
        if (!this.state.showImages) {
            this.addPreloadedNext();
            this.setState({ showImages: true });
        }
    }

    addPreloadedNext() {
        console.log("addPreloadedNext")
        this.setState({
            images : [...this.state.images, ...this.nextPageForPreloading]
        });
        this.nextPageForPreloading = [];
        fetch(`https://picsum.photos/v2/list?page=${this.currentPage}&limit=20`).then(res => res.json()).then((result : PicsumImage[]) => {
            this.nextPageForPreloading = result;
            FastImage.preload(this.nextPageForPreloading.map(r => {return { uri : r.download_url, priority: FastImage.priority.normal }}));
            this.currentPage++;
        }).catch((err) => {
            console.log("error:", err);
        });
    }

    // componentDidUpdate(prevProps: Readonly<PhotoMediaLibraryProps>, prevState: Readonly<PhotoMediaLibraryState>) {
    //     if (prevState.page !== this.state.page) {
    //         fetch(`https://picsum.photos/v2/list?page=${this.state.page}&limit=20`).then(res => res.json()).then((result : PicsumImage[]) => {
    //             this.setState({ images : [...this.state.images, ...result] });
    //         });
    //     }
    // }

    loadMore() {
        // this.setState({
        //     page: this.state.page + 1
        // });
        this.addPreloadedNext();
    }

    onLoaded(event : LoadingMediaEvent) {
        let loadingTimes = [...this.state.loadingTimes, event];

        let millisTimes = loadingTimes.map((t) => t.millis);
        let sumTimes = millisTimes.reduce((pv, cv) => pv + cv, 0);
        let averageTimes = loadingTimes.length > 0 ? sumTimes / loadingTimes.length : 0;
        let variance = loadingTimes.length > 0 ? ((millisTimes.map((millis) => Math.pow((millis - averageTimes), 2)).reduce((pv, cv) => pv + cv, 0)) / loadingTimes.length) : 0;
        let standardDeviation = Math.sqrt(variance);
        let min = Math.min(...millisTimes);
        let max = Math.max(...millisTimes);

        this.setState({
            loadingTimes : loadingTimes,
            sum: sumTimes,
            average: averageTimes,
            variance: variance,
            standardDeviation: standardDeviation,
            minimum: min,
            maximum: max
        });
    }

    renderItem(listItem : PicsumImage) {
        return (
            <LoadingImage key={listItem.id} url={listItem.download_url} onLoaded={this.onLoaded.bind(this)}/>
        );
    }

    renderImages() {
        return this.state.images.map((image) => {
            return this.renderItem(image)
        })
    }

    renderRefreshing() {
        return (
            <View style={{ flex : 1, alignItems : 'center', justifyContent : 'center' }}>
                <ActivityIndicator color="#FF0000"></ActivityIndicator>
            </View>
        );
    }

    renderNoElements() {
        return (
            <View>
                <Text>No elements</Text>
            </View>
        )
    }

    renderLoadingTimes() {
        let { showImages, images, sum, average, variance, standardDeviation, minimum, maximum } = this.state;
        
        return (
            showImages &&
            (<View>
                <Text>Total images: {images.length}</Text>
                <Text>Total loading: {sum}ms</Text>
                <Text>Average loading: {average}ms</Text>
                <Text>Variance: {variance}</Text>
                <Text>Standard Deviation: {standardDeviation}</Text>
                <Text>Minimum: {minimum}</Text>
                <Text>Maximum: {maximum}</Text>
            </View>)
        );
    }

    render() {
        let { images, showImages } = this.state;

        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}>
                <View style={{ flex: 1 }}>
                    { this.renderLoadingTimes() }
                    { showImages && (images.length > 0 ? this.renderImages() : this.renderNoElements()) }
                    <TouchableOpacity onPress={this.loadMore} style={styles.refresh}>
                        <Text style={styles.refreshText}>Load more</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: "#FFF",
    },
    refresh : {
        width: '100%',
        height: 50,
        backgroundColor: '#09AC32',
        alignItems: 'center',
        justifyContent: 'center'
    },
    refreshText: {
        color: '#FFF'
    }
});