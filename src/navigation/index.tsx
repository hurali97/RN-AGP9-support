import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home';
import DetailsScreen from '../screens/Details';

const RootStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false,
    },
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
});

type RootStackType = typeof RootStack;

declare module '@react-navigation/core' {
  interface RootNavigator extends RootStackType {}
}

const Navigation = createStaticNavigation(RootStack);

export default Navigation;