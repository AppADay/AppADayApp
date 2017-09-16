import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import Emoji from 'react-native-emoji';
import Camera from 'react-native-camera';
import fs from 'react-native-fs';
import idx from 'idx';

import { VISION_API_KEY as API_KEY } from './constants';

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
  return results.filter(
    result => !blackList.includes(result.description.toLowerCase()),
  );
};

export default class CameraView extends Component {
  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera
      .capture({ metadata: options, jpegQuality: 95 })
      .then(data => retrieveBase64ImageFromStorage(data.path))
      .then(image => analyzeImage(image))
      .then(response => filterResults(response))
      .then(filteredResults => console.log({ filteredResults }))
      .catch(err => console.error(err));
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
            style={{ opacity: 0.6, width: 85, height: 85 }}
            source={require('./../assets/pineapple.png')}
          />
          <Image
            style={styles.fruit}
            source={require('./../assets/apple.png')}
          />
          <Image
            style={styles.fruit}
            source={require('./../assets/banana.png')}
          />
          <Image
            style={styles.fruit}
            source={require('./../assets/pear.png')}
          />
          <Image
            style={styles.fruit}
            source={require('./../assets/orange.png')}
          />
        </View>
        <View style={styles.challengeWrapper}>
          <View style={styles.challengeTitle}>
            <Image
              source={require('./../assets/camera_TropicalChallenge.png')}
            />
          </View>
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
