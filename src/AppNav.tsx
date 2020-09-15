import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import PhotoMediaLibrary from './pages/PhotoMediaLibrary';
import VideoMediaLibrary from './pages/VideoMediaLibrary';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const AppTabs = createBottomTabNavigator();

function AppNavigation() {
    return (
        <NavigationContainer>
            <AppTabs.Navigator >
                <AppTabs.Screen name="Photos" component={PhotoMediaLibrary}></AppTabs.Screen>
                <AppTabs.Screen name="Videos" component={VideoMediaLibrary}></AppTabs.Screen>
            </AppTabs.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigation;