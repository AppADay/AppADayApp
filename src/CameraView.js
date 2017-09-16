import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Emoji from 'react-native-emoji';
import Camera from 'react-native-camera';
import fs from 'react-native-fs';

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
                  maxResults: 3,
                },
              ],
            },
          ],
        }),
      }),
    )
    .then(response => response.json());
};

export default class CameraView extends Component {
  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera
      .capture({ metadata: options, jpegQuality: 80 })
      .then(data => retrieveBase64ImageFromStorage(data.path))
      .then(image => analyzeImage(image))
      .then(response => console.log({ response }))
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
          <Text style={styles.capture} onPress={this.takePicture}>
            <Emoji name="pineapple" />
          </Text>
        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: '#fff',

    // alignItems: 'center',
    // justifyContent: 'center',
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
});
