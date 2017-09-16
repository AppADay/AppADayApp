import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Emoji from 'react-native-emoji';
import Camera from 'react-native-camera';

export default class CameraView extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Hello</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
  },
});
