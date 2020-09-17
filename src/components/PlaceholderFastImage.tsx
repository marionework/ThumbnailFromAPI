import React, { Component } from "react";
import { ActivityIndicator, ImageStyle, StyleSheet, View, StyleProp } from "react-native";
import FastImage, { FastImageProps } from "react-native-fast-image";

export interface PlaceholderFastImageProps extends FastImageProps {
}

export interface PlaceholderFastImageState {
    isLoading : boolean
}

export default class PlaceholderFastImage extends Component<PlaceholderFastImageProps, PlaceholderFastImageState> {
    constructor(props : PlaceholderFastImageProps) {
        super(props);

        this.state = {
            isLoading : true
        }
    }

    renderLoading() {
        let { style } = this.props;
        return (
            <View style={[styles.loadingBackground, style]}>
                 <ActivityIndicator size="large" color="#BBB" />
            </View>
        );
    }

    onLoadEnd() {
        let { onLoadEnd } = this.props;
        this.setState({ isLoading : false }, () => {
            if (onLoadEnd) {
                onLoadEnd();
            }
        });
    }

    render() {
        let { style } = this.props;
        let { isLoading } = this.state;

        return (
            <View style={style}>
                {isLoading && this.renderLoading()}
                <FastImage {...this.props} style={[style]} onLoadEnd={this.onLoadEnd.bind(this)}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loadingBackground: {
        backgroundColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center'
    }
});