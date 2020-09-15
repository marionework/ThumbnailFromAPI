import React, { Component } from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet, View, Text } from 'react-native';

export interface LoadingImageEvent { 
    millis: number
    url: string 
}

export interface LoadingImageProps {
    url: string,
    onLoaded: (event : LoadingImageEvent) => void
}

export interface LoadingImageState {
    millis: number
}

export default class LoadingImage extends Component<LoadingImageProps, LoadingImageState> {
    startTime: number
    endTime: number

    constructor(props : LoadingImageProps) {
        super(props);

        this.startTime = 0;
        this.endTime = 0;

        this.state = {
            millis: 0
        }
    }

    startTimer() {
        this.startTime = new Date().getTime();
    }

    componentWillUnmount() {
        this.startTime = 0;
        this.endTime = 0;
    }

    endTimer() {
        console.log("end timer")
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
        let { millis } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.image}>
                    <FastImage
                        style={{ width: 75, height: 75, margin: 5 }}
                        source={{
                            uri: url,
                            priority: FastImage.priority.normal,
                        }}
                        onLoadStart={() => { this.startTimer() }}
                        onLoad={() => { this.endTimer() }}
                    />
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
        flex: 1
    },
    image: {
        flex: 2
    },
    timer: {
        flex: 5
    }
});