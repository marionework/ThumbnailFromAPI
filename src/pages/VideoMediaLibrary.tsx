import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import LoadingImage from '../components/LoadingImage';
import LoadingVideo from '../components/LoadingVideo';
import { createThumbnail } from "react-native-create-thumbnail";
import LoadingMediaEvent from '../types/LoadingMediaEvent';

export interface PicsumImage {
    author : string
    download_url : string
    height: number
    id: string
    url : string 
    width: number
}

export interface VideoMediaLibraryProps {
}

export interface VideoMediaLibraryState {
    videos: string[]
    refreshing: boolean,
    loadingTimes: LoadingMediaEvent[],
    sum: number,
    average: number,
    variance: number,
    standardDeviation: number,
    minimum: number,
    maximum: number
}

export default class VideoMediaLibrary extends Component<VideoMediaLibraryProps, VideoMediaLibraryState> {
    startTime : number
    endTime : number
    
    constructor(props : VideoMediaLibraryProps) {
        super(props);
        this.refresh = this.refresh.bind(this);

        this.state = {
            videos: [],
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

    renderItem(listItem : string, index : number) {
        return (
            // <LoadingImage key={listItem.id} url={listItem.download_url} onLoaded={(event : LoadingImageEvent) => {
            //     this.setState({
            //         loadingTimes : [...this.state.loadingTimes, event]
            //     });
            // }}/>
            // <View key={listItem}></View>
            <LoadingVideo url={listItem} key={listItem + index} onLoaded={this.onLoaded.bind(this)}></LoadingVideo>
        );
    }

    renderVideos() {
        return this.state.videos.map((video, index) => {
            return this.renderItem(video, index)
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
        this.setState({ refreshing: true, videos : [] });
        setTimeout(() => {
            this.setState({ refreshing : false, videos : [
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
            ]});
        }, 2000);
    }

    renderNoElements() {
        return (
            <View>
                <Text>No elements</Text>
            </View>
        )
    }

    renderLoadingTimes() {
        let { refreshing, videos, sum, average, variance, standardDeviation, minimum, maximum } = this.state;
        
        return (
            !refreshing &&
            (<View>
                <Text>Total images: {videos.length}</Text>
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
        let { videos, refreshing } = this.state;

        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}>
                <View style={{ flex: 1 }}>
                    { this.renderLoadingTimes() }
                    { !refreshing && <TouchableOpacity onPress={this.refresh} style={styles.refresh}>
                        <Text style={styles.refreshText}>Get Videos</Text>
                    </TouchableOpacity> }
                    { !refreshing ? (videos.length > 0 ? this.renderVideos() : this.renderNoElements()) : this.renderRefreshing() }
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