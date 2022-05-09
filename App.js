import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import { Vibration, Alert } from "react-native";
import Alarms from "./screens/Alarms";
import Songs from "./screens/Songs";

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const ALARMS = "Alarms"
export const SONGS = "Songs"

const Tab = createBottomTabNavigator();

export default function App() {

  const [sound] = useState(new Audio.Sound());
  const [alarms, setAlarms] = useState([]);
  const [songs, setSongs] = useState([]);

  const [chosenPlayingSong, setChosenPlayingSong] = useState(null);

  useEffect(() => {

    var isAlarmRunning = false;
    var lastTimeAlarmRun = null;

    const interval = setInterval(() => {

      let currentDate = new Date();
      let currentDay = currentDate.getDay();

      let currentHours = currentDate.getHours().toString();
      let currentMinutes = currentDate.getMinutes().toString();

      if (currentHours.length == 1) {
        currentHours = "0" + currentHours;
      }

      if (currentMinutes.length == 1) {
        currentMinutes = "0" + currentMinutes;
      }


      let currentTime = currentHours + ":" + currentMinutes;

      switch (currentDay) {
        case 1:
          currentDay = 2;
          break;
        case 2:
          currentDay = 3;
          break;
        case 3:
          currentDay = 4;
          break;
        case 4:
          currentDay = 5;
          break;
        case 5:
          currentDay = 6;
          break;
        case 6:
          currentDay = 7;
          break;
        case 0:
          currentDay = 1;
          break;
      }

      let sqlCondition = "%" + currentDay.toString() + "%";
      let inputDay = sqlCondition.replace(/"/g, "'");
      let inputTime = currentTime.replace(/"/g, "'");

      db.transaction(function (tx) {
        tx.executeSql(
          "SELECT alarms.alarmId, songs.songLocation, alarms.alarmName, alarms.alarmTime FROM alarms LEFT JOIN songs ON songs.songId = alarms.songId WHERE alarms.alarmDays LIKE ? AND alarms.alarmTime = ? AND alarms.alarmActive = 1",
          [inputDay, inputTime],
          async (tx, results) => {
            if (results.rows.length == 1 && isAlarmRunning == false && lastTimeAlarmRun != currentTime) {
              let alarm = results.rows.item(0);

              lastTimeAlarmRun = currentTime;
              setChosenPlayingSong(null);
              isAlarmRunning = true;

              let status = await sound.getStatusAsync();
              if (status.isLoaded == true) {
                await sound.unloadAsync();
              }

              if (alarm.songLocation == null) {

                Vibration.vibrate([300, 300, 300], true);

              }
              else {
                await sound.loadAsync({ uri: alarm.songLocation },
                  {
                    isLooping: true
                  });

                await sound.playAsync();
              }

              Alert.alert(
                'Budík se spustil',
                `Popis budíku: ${alarm.alarmName}\nČas: ${alarm.alarmTime}`,
                [
                  {
                    text: 'Ok',
                    onPress: async () => {
                      if (alarm.songLocation == null) {
                        Vibration.cancel();
                      }
                      else {
                        await sound.unloadAsync();
                      }

                      isAlarmRunning = false;
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          }
        );
      });

    }, 3000);
    return () => clearInterval(interval);
  }, []);


  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName={ALARMS}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case ALARMS: iconName = "alarm-sharp"; break;
                case SONGS: iconName = "musical-notes-sharp"; break;
                default: iconName = "alarm-sharp";
              }
              return <Ionicons name={iconName} size={size} color={color} />;

            },
            tabBarActiveTintColor: "red",
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name={ALARMS} children={() => <Alarms alarms={alarms} setAlarms={setAlarms} songs={songs} setSongs={setSongs} />} options={{ title: 'Budíky', headerStyle: { backgroundColor: 'yellow' } }} />
          <Tab.Screen name={SONGS} children={() => <Songs chosenPlayingSong={chosenPlayingSong} setChosenPlayingSong={setChosenPlayingSong} sound={sound} songs={songs} setSongs={setSongs} setAlarms={setAlarms} />} options={{ title: 'Písničky', headerStyle: { backgroundColor: 'green' } }} />

        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}