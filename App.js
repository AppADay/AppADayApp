import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DailyFruit from './src/DailyFruit';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <DailyFruit />
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
});
