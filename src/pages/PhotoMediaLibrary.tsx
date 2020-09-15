import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
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
}

export interface PhotoMediaLibraryState {
    images: PicsumImage[]
    refreshing: boolean,
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
    
    constructor(props : PhotoMediaLibraryProps) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.getPhotos = this.getPhotos.bind(this);

        this.state = {
            images : [],
            refreshing: false,
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
    }

    componentDidMount() {
        this.startTime = new Date().getTime();
    }

    getPhotos() {
        this.fetchImages();
    }

    fetchImages() {
        this.setState({ refreshing: true });
        fetch("https://picsum.photos/v2/list?page=2&limit=20").then(res => res.json()).then((result : PicsumImage[]) => {
            console.log("render imageItems", result[0]);
            this.setState({ images: result, refreshing: false });
        }).catch((err) => {
            console.log("error:", err)
            this.setState({ refreshing: false });
        });
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

    refresh() {
        this.setState({ images : [], refreshing: true });
        this.fetchImages();
    }

    renderNoElements() {
        return (
            <View>
                <Text>No elements</Text>
            </View>
        )
    }

    renderLoadingTimes() {
        let { refreshing, images, sum, average, variance, standardDeviation, minimum, maximum } = this.state;
        
        return (
            !refreshing &&
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
        let { images, refreshing } = this.state;

        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}>
                <View style={{ flex: 1 }}>
                    { this.renderLoadingTimes() }
                    { !refreshing && <TouchableOpacity onPress={this.refresh} style={styles.refresh}>
                        <Text style={styles.refreshText}>Get Photos</Text>
                    </TouchableOpacity> }
                    { !refreshing ? (images.length > 0 ? this.renderImages() : this.renderNoElements()) : this.renderRefreshing() }
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