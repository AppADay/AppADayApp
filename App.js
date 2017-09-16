import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs, Tab, Icon } from 'react-native-elements';

import CameraView from './src/CameraView';
import LeaderBoard from './src/LeaderBoard';

console.disableYellowBox = true;

export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedTab: 'cameraView',
      visionResult: null,
    };
  }

  changeTab = selectedTab => {
    this.setState({ selectedTab });
  };

  render() {
    const { selectedTab } = this.state;
    return (
      <Tabs>
        <Tab
          titleStyle={{ fontWeight: 'bold', fontSize: 10 }}
          selectedTitleStyle={{ marginTop: -1, marginBottom: 6 }}
          selected={selectedTab === 'cameraView'}
          title={selectedTab === 'cameraView' ? 'CAMERA' : null}
          renderIcon={() => (
            <Icon
              containerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 12,
              }}
              color={'#5e6977'}
              type="ionicon"
              name="ios-camera-outline"
              size={33}
            />
          )}
          renderSelectedIcon={() => (
            <Icon
              color={'#6296f9'}
              type="ionicon"
              name="ios-camera-outline"
              size={30}
            />
          )}
          onPress={() => this.changeTab('cameraView')}
        >
          <CameraView />
        </Tab>
        <Tab
          titleStyle={{ fontWeight: 'bold', fontSize: 10 }}
          selectedTitleStyle={{ marginTop: -1, marginBottom: 6 }}
          selected={selectedTab === 'leaderBoard'}
          title={selectedTab === 'leaderBaord' ? 'LEADER_BOARD' : null}
          renderIcon={() => (
            <Icon
              containerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 12,
              }}
              type="octicon"
              color={'#5e6977'}
              name="list-ordered"
              size={33}
            />
          )}
          renderSelectedIcon={() => (
            <Icon
              color={'#6296f9'}
              type="octicon"
              name="list-ordered"
              size={30}
            />
          )}
          onPress={() => this.changeTab('leaderBoard')}
        >
          <LeaderBoard />
        </Tab>
      </Tabs>
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
