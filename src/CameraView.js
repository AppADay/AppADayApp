import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import Emoji from 'react-native-emoji';
import Camera from 'react-native-camera';
import fs from 'react-native-fs';
import idx from 'idx';

import { VISION_API_KEY as API_KEY } from './constants';

const fruits = {
  pineapple: require('./../assets/pineapple.png'),
  apple: require('./../assets/apple.png'),
  banana: require('./../assets/banana.png'),
  ['banana family']: require('./../assets/banana.png'),
  pear: require('./../assets/pear.png'),
  orange: require('./../assets/orange.png'),
  citrus: require('./../assets/orange.png'),
  lemon: require('./../assets/orange.png'),
  poo: require('./../assets/poo.png'),
};

const getRealImagePath = path => {
  if (Platform.OS === 'ios') return path;

  const matches = path.match(/^file:\/{2}(.+\.jpg)$/);
  return matches[1] || path;
};

const retrieveBase64ImageFromStorage = imagePath => {
  const path = getRealImagePath(imagePath);

  if (path && fs.exists(path)) {
    return Promise.resolve().then(() => fs.readFile(path, 'base64'));
  }
  return null;
};

const analyzeImage = base64Image => {
  if (!base64Image) return null;
  return Promise.resolve()
    .then(() =>
      fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 5,
                },
              ],
            },
          ],
        }),
      }),
    )
    .then(response => response.json());
};

const blackList = [
  'produce',
  'fruit',
  'food',
  'local food',
  'still life',
  'cooking plantain',
  'yuzu',
];

const filterResults = response => {
  const results = idx(response, _ => _.responses[0].labelAnnotations);
  const filtered = results.filter(
    result => !blackList.includes(result.description.toLowerCase()),
  );
  return filtered.map(item => item.description);
};

export default class CameraView extends Component {
  state = {
    bounceValue: new Animated.Value(0),
    rotateValue: new Animated.Value(0),
    translateValue: new Animated.ValueXY({ x: 0, y: 0 }), // 二维坐标
    fadeOutOpacity: new Animated.Value(0),
    resultImage: 'poo',
    isShowingResultImage: false,
  };

  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera
      .capture({ metadata: options, jpegQuality: 95 })
      .then(data => retrieveBase64ImageFromStorage(data.path))
      .then(image => analyzeImage(image))
      .then(response => filterResults(response))
      .then(filteredResults => this.showAnimation(filteredResults))
      .catch(err => console.error(err));
  };

  showAnimation = resultArray => {
    const result = resultArray.length ? resultArray[0] : 'poo';
    const possibleFruits = Object.keys(fruits);
    console.log({ resultArray, result, possibleFruits });
    if (possibleFruits.includes(result)) {
      // Hallo animation
      this.setState({ resultImage: result }, this.startAnimation);
    } else {
      // Shit animation
      this.setState({ resultImage: 'poo' }, this.startAnimation);
    }
    return null;
  };

  startAnimation = () => {
    this.setState({ isShowingResultImage: true });

    this.state.bounceValue.setValue(1.5); // 设置一个较大的初始值
    this.state.rotateValue.setValue(0);
    this.state.translateValue.setValue({ x: 10, y: 10 });
    this.state.fadeOutOpacity.setValue(1);

    Animated.sequence([
      Animated.sequence([
        Animated.spring(
          //  the
          this.state.bounceValue,
          {
            toValue: 0.8,
            friction: 1, // defaut:7.
            tension: 40, //maximal
          },
        ),
        Animated.delay(1000),
        Animated.timing(this.state.rotateValue, {
          toValue: 1,
          duration: 400, // defaut 500ms
          easing: Easing.out(Easing.quad), // 一个用于定义曲线的渐变函数
          delay: 0, // 在一段时间之后开始动画（单位是毫秒），默认为0。
        }),
        Animated.decay(
          //  S=vt-（at^2）/2   v=v - at
          this.state.translateValue,
          {
            velocity: 100, // 起始速度，必填参数。
            deceleration: 0.8, // 速度衰减比例，默认为0.997。
          },
        ),
      ]),
      Animated.timing(this.state.fadeOutOpacity, {
        toValue: 0,
        duration: 2000,
        easing: Easing.linear, // 线性的渐变函数
      }),
    ]).start(() => this.setState({ isShowingResultImage: false })); // no cricle

    // // 监听值的变化
    // this.state.rotateValue.addListener(state => {
    //   console.log('rotateValue=>' + state.value);
    // });

    // // ValueXY
    // this.state.translateValue.addListener(value => {
    //   console.log('translateValue=>x:' + value.x + ' y:' + value.y);
    // });

    // this.state.fadeOutOpacity.addListener(state => {
    //   console.log('fadeOutOpacity=>' + state.value);
    // });
  };

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={cam => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
          captureQuality={Camera.constants.CaptureQuality.low}
        >
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.button} onPress={this.takePicture}>
              <View style={styles.buttonOuter}>
                <View style={styles.buttonInner} />
              </View>
            </TouchableOpacity>
          </View>
        </Camera>
        <View style={styles.emojiBar}>
          <Image
            style={{ opacity: 0.6, width: 80, height: 80, marginRight: 5 }}
            source={fruits.pineapple}
          />
          <Image style={styles.fruit} source={fruits.apple} />
          <Image
            style={{ opacity: 0.6, width: 70, height: 70, marginLeft: 15 }}
            source={fruits.banana}
          />
          <Image style={styles.fruit} source={fruits.pear} />
          <Image
            style={{ opacity: 0.6, width: 70, height: 70, marginLeft: 8 }}
            source={fruits.orange}
          />
        </View>
        <View style={styles.challengeWrapper}>
          <View style={styles.challengeTitle}>
            <Image
              source={require('./../assets/camera_TropicalChallenge.png')}
            />
          </View>
        </View>
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View
            style={{
              transform: [
                { scale: this.state.bounceValue }, // 缩放
                {
                  rotate: this.state.rotateValue.interpolate({
                    // 旋转，
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { translateX: this.state.translateValue.x }, // x轴移动
                { translateY: this.state.translateValue.y }, // y轴移动
              ],
              opacity: this.state.fadeOutOpacity, // 透明度
            }}
          >
            <Image
              source={fruits[this.state.resultImage]}
              style={{ width: 200, height: 200 }}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,

    // alignItems: 'center',
    // justifyContent: 'center',
  },
  emojiBar: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fruit: {
    width: 70,
    height: 70,
    opacity: 0.6,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    padding: 10,
    margin: 40,
    fontSize: 160,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 70,
  },
  buttonOuter: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ED7D7D',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    width: 66,
    height: 66,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  challengeWrapper: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitle: {},
});
