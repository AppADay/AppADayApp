import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Emoji from 'react-native-emoji';

export default class DailyFruit extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 150 }}>
          <Emoji name="pineapple" />
        </Text>
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
