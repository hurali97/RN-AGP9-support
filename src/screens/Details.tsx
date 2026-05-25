import { Button, Text, View } from "react-native";
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';
import Share from 'react-native-share';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import type { StaticScreenProps } from '@react-navigation/native';

const MyPager = () => {
  return (
    <PagerView style={{ flex: 1 }} initialPage={0}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
        }}
        key="1"
      >
        <Text>First page</Text>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'blue',
        }}
        key="2"
      >
        <Text>Second page</Text>
      </View>
    </PagerView>
  );
};

const MyAnimated = () => {
  const width = useSharedValue(100);
  const handlePress = () => {
    width.value = withTiming(Math.random() * 100 + 50);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width,
          height: 100,
          backgroundColor: 'violet',
          marginBottom: 20,
        }}
      />
      <Button onPress={handlePress} title="Click me" />
    </View>
  );
};

const MyShare = () => {
  const handleShare = () => {
    Share.open({
      message: 'Share this',
      url: 'https://www.google.com',
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button onPress={handleShare} title="Share" />
    </View>
  );
};

const MySkia = () => {
  const width = 256;
  const height = 256;
  const r = width * 0.33;
  return (
    <Canvas style={{ width, height, alignSelf: 'center', marginTop: 100 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

type ComponentType = 'pager' | 'animated' | 'share' | 'skia';

//   const [type, setType] = useState<ComponentType>('pager');

const ComponentSwitcher = ({ type }: { type: ComponentType }) => {
  switch (type) {
    case 'pager':
      return <MyPager />;
    case 'animated':
      return <MyAnimated />;
    case 'share':
      return <MyShare />;
    case 'skia':
      return <MySkia />;
    default:
      return null;
  }
};

type Props = StaticScreenProps<{
    type: ComponentType;
  }>;

const DetailsScreen = ({ route }: Props) => {
  const { type } = route.params;
  return <ComponentSwitcher type={type} />;
};

export default DetailsScreen;