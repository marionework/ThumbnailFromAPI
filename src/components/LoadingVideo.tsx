import React, { Component } from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet, View, Text, Image } from 'react-native';
import LoadingMediaEvent from '../types/LoadingMediaEvent';
import { createThumbnail, Thumbnail } from 'react-native-create-thumbnail';

export interface LoadingVideoProps {
    url: string,
    onLoaded: (event : LoadingMediaEvent) => void
}

export interface LoadingVideoState {
    millis: number,
    thumbnail: Thumbnail | null
}

export default class LoadingImage extends Component<LoadingVideoProps, LoadingVideoState> {
    startTime: number
    endTime: number

    constructor(props : LoadingVideoProps) {
        super(props);

        this.startTime = 0;
        this.endTime = 0;

        this.state = {
            millis: 0,
            thumbnail: null
        }
    }

    componentDidMount() {
        let { url } = this.props;
        this.startTime = new Date().getTime();
        console.log("start create thumbnail", url)
        createThumbnail({
            url: url,
            timeStamp: 10000
        }).then(response => {
            console.log("end create thumbnail", url, response)
            this.setState({
                thumbnail: response
            });
            this.endTimer();
        })
    }

    componentWillUnmount() {
        this.startTime = 0;
        this.endTime = 0;
    }

    endTimer() {
        let { url, onLoaded } = this.props;
        this.endTime = new Date().getTime();
        let totalTime = this.endTime - this.startTime;
        this.setState({
            millis: totalTime
        });
        onLoaded({
            url,
            millis: totalTime
        });

    }

    render() {
        let { url } = this.props;
        let { millis, thumbnail } = this.state;
        let scale = thumbnail ? (thumbnail.width / thumbnail.height) : 1;
        let maxHeight = 75;
        let maxWidth = 100;
        let height = scale * maxWidth;

        return (
            <View style={styles.container}>
                <View style={styles.image}>
                    { thumbnail && <Image style={{
                                        width: maxWidth,
                                        height: height,
                                        resizeMode: 'contain'
                                    }} source={{ uri: thumbnail.path }}></Image> }
                </View>
                <View style={styles.timer}>
                    <Text>{url}</Text>
                    <Text>{millis}ms</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        height: 75
    },
    image: {
        flex: 2
    },
    timer: {
        flex: 5
    }
});