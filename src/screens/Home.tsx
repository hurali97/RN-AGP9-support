import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Button,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={styles.container}
      >
        <Button
          onPress={() => navigation.navigate('Details', { type: 'pager' })}
          title="Switch to pager"
        />
        <Button
          onPress={() => navigation.navigate('Details', { type: 'animated' })}
          title="Switch to animated"
        />
        <Button
          onPress={() => navigation.navigate('Details', { type: 'share' })}
          title="Switch to share"
        />
        <Button
          onPress={() => navigation.navigate('Details', { type: 'skia' })}
          title="Switch to skia"
        />
        <Button
          onPress={() => navigation.navigate('Details', { type: 'svg' })}
          title="Switch to svg"
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    marginTop: 100,
    alignItems: 'flex-start',
    gap: 10,
  },
});

export default HomeScreen;
