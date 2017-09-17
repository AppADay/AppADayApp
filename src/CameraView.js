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
  InteractionManager,
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

const fruitMatch = {
  pineapple: 'pineapple',
  apple: 'apple',
  banana: 'banana',
  ['banana family']: 'banana',
  pear: 'pear',
  orange: 'orange',
  citrus: 'orange',
  lemon: 'orange',
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
    startFadeOut: new Animated.Value(0),
    startMoveIn: new Animated.Value(0),
    resultImage: 'poo',
    isShowingResultImage: false,
    score: {
      pineapple: false,
      apple: false,
      banana: false,
      pear: false,
      orange: false,
    },
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

  sendLoserPost = () => {
    return Promise.resolve()
      .then(() =>
        fetch(`http://be332e2a.ngrok.io/loser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Accept': 'application/json',
            // 'Access-Key': 'myAccessKey',  // use in future for safer requests
          },
          body: JSON.stringify({
            email1: 'bla',
          }),
        }),
      )
      .then(response => response.json());
  };

  sendLoser = () => {
    return Promise.resolve()
      .then(() =>
        fetch(`http://be332e2a.ngrok.io/loser`, {
          method: 'GET',
        }),
      )
      .then(response => response.json());
  };

  showAnimation = resultArray => {
    const result = resultArray.length ? resultArray[0] : 'poo';
    const possibleFruits = Object.keys(fruits);
    console.log({ resultArray, result, possibleFruits });
    if (possibleFruits.includes(result)) {
      // Fruit animation
      this.setState(
        {
          resultImage: result,
          score: {
            ...this.state.score,
            [fruitMatch[result]]: true,
          },
        },
        this.startAnimation,
      );
    } else {
      // Shit animation
      this.setState({ resultImage: 'poo' }, this.startAnimation);
      // send request out!
      this.sendLoser();
    }
    return null;
  };

  startAnimation = () => {
    this.setState({ isShowingResultImage: true });
    console.log({ state: this.state });

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
            friction: 3, // defaut:7.
            tension: 40, //maximal
          },
        ),
        Animated.delay(1000),
        Animated.timing(this.state.rotateValue, {
          toValue: 1,
          duration: 600, // defaut 500ms
          easing: Easing.out(Easing.quad), // 一个用于定义曲线的渐变函数
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
        duration: 1000,
        easing: Easing.linear, // 线性的渐变函数
      }),
    ]).start(() => this.setState({ isShowingResultImage: false })); // no cricle
  };

  bannerAnimation = () => {
    Animated.sequence([
      Animated.timing(this.state.startMoveIn, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        delay: 6000,
      }),
      Animated.timing(this.state.startFadeOut, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
      }),
    ]).start();
  };

  renderCheckMark = name =>
    this.state.score[name] ? (
      <Image
        style={styles.checkMark}
        source={require('./../assets/checkmark.png')}
      />
    ) : null;

  componentDidMount() {
    // animation
    InteractionManager.runAfterInteractions(() => setTimeout(() => {}, 2000));
    this.bannerAnimation();
  }

  render() {
    const { score } = this.state;

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
          <View>
            <Image
              style={{
                opacity: score.pineapple ? 1 : 0.6,
                width: 80,
                height: 80,
                marginRight: 5,
              }}
              source={fruits.pineapple}
            />
            {this.renderCheckMark('pineapple')}
          </View>
          <View>
            <Image
              style={{
                opacity: score.apple ? 1 : 0.6,
                width: 75,
                height: 75,
                marginRight: 5,
              }}
              source={fruits.apple}
            />
            {this.renderCheckMark('apple')}
          </View>
          <View>
            <Image
              style={{
                opacity: score.banana ? 1 : 0.6,
                width: 70,
                height: 70,
                marginLeft: 15,
              }}
              source={fruits.banana}
            />
            {this.renderCheckMark('banana')}
          </View>
          <View>
            <Image
              style={{
                opacity: score.pear ? 1 : 0.6,
                width: 70,
                height: 70,
              }}
              source={fruits.pear}
            />
            {this.renderCheckMark('pear')}
          </View>
          <View>
            <Image
              style={{
                opacity: score.orange ? 1 : 0.6,
                width: 70,
                height: 70,
                marginLeft: 5,
              }}
              source={fruits.orange}
            />
            {this.renderCheckMark('orange')}
          </View>
        </View>
        <Animated.View
          style={{
            position: 'absolute',
            top: this.state.startMoveIn.interpolate({
              inputRange: [0, 1],
              outputRange: [-70, 140],
            }),
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: this.state.startFadeOut.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          }}
        >
          <View style={styles.challengeTitle}>
            <Image
              source={require('./../assets/camera_TropicalChallenge.png')}
            />
          </View>
        </Animated.View>
        {this.state.isShowingResultImage ? (
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
                      outputRange: ['0deg', '180deg'],
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
        ) : null}
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
  checkMark: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 55,
    height: 55,
  },
});
