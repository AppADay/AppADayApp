import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Emoji from 'react-native-emoji';
import Camera from 'react-native-camera';

export default class DailyFruit extends Component {
  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera
      .capture({ metadata: options })
      .then(data => console.log(data))
      .catch(err => console.error(err));
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 150 }}>
          <Emoji name="pineapple" />
        </Text>
        <Camera
          ref={cam => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
        >
          <Text style={styles.capture} onPress={this.takePicture}>
            [CAPTURE]
          </Text>
        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40,
  },
});
