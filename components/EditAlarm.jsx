import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Switch, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DayPicker } from 'react-native-picker-weekday'
import * as SQLite from 'expo-sqlite';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const EditAlarm = props => {

  const [alarmName, setAlarmName] = useState(props.alarm.alarmName);
  const [alarmSong, setAlarmSong] = useState(props.alarm.songId);
  const [alarmStatus, setAlarmStatus] = useState(props.alarm.alarmActive == 0 ? false : true);
  const [alarmDays, setAlarmDays] = useState([-1])
  const [alarmTime, setAlarmTime] = useState(new Date(1598051730000));

  const [showAlarmTimer, setShowAlarmTimer] = useState(false);

  const onAlarmTimeChange = (event, selectedDate) => {

    const currentDate = selectedDate;

    setShowAlarmTimer(false);
    if (currentDate != null) {
      setAlarmTime(currentDate);
    }


  };

  const toggleSwitch = () => setAlarmStatus(previousState => !previousState);

  const alarmNameInputHandler = enteredText => {
    setAlarmName(enteredText);
  };


  useEffect(() => {
    let alarmTimeArray = props.alarm.alarmTime.split(":");
    let alarmDaysArray = props.alarm.alarmDays.split("");
    let alarmDaysNumberArray = [];

    alarmDaysArray.forEach(element => {
      alarmDaysNumberArray.push(parseInt(element));
    });

    alarmDaysNumberArray.unshift(-1)

    let alarmTimeHours = parseInt(alarmTimeArray[0]);
    let alarmTimeMinutes = parseInt(alarmTimeArray[1]);

    setAlarmTime(new Date(2020, 4, 12, alarmTimeHours, alarmTimeMinutes));
    setAlarmDays(alarmDaysNumberArray);
  }, []);

  return (
    <Modal visible={props.isVisible} animationType="slide">
      <ScrollView>
        <Text style={{ fontSize: 24, padding: 10 }}>Upravit budík</Text>

        <Text style={{ fontSize: 16, padding: 10, marginTop: 10, fontWeight: "bold" }}>Popis budíku</Text>

        <TextInput
          placeholder="Zadejte popis"
          style={styles.input}
          onChangeText={alarmNameInputHandler}
          value={alarmName}
        />

        <Text style={{ fontSize: 16, padding: 10, fontWeight: "bold" }}>Výběr písničky (volitelně)</Text>
        <Picker
          style={{ margin: 10, }}
          selectedValue={alarmSong}
          onValueChange={(itemValue, itemIndex) =>
            setAlarmSong(itemValue)
          }>
          <Picker.Item key={0} label="Žádná" value={null} />
          {props.songs.map((song) =>
            <Picker.Item key={song.songId} label={song.songName} value={song.songId} />
          )}
        </Picker>
        <Text style={{ fontSize: 16, padding: 10, fontWeight: "bold" }}>Stav budíku (aktivní × neaktivní)</Text>

        <View style={styles.switchContainer}>

          <Switch
            trackColor={{ false: "#767577", true: "blue" }}
            thumbColor={alarmStatus ? "green" : "red"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={alarmStatus}
          />
          <Text style={{ marginLeft: 10, color: alarmStatus ? "green" : "red" }}>{alarmStatus ? "Aktivní" : "Neaktivní"}</Text>
        </View>
        <Text style={{ fontSize: 16, paddingLeft: 10, paddingTop: 10, fontWeight: "bold" }}>Určené dny či den</Text>

        <DayPicker
          weekdays={alarmDays}
          setWeekdays={setAlarmDays}
          activeColor='blue'
          textColor='white'
          inactiveColor="gray"
        />

        <Text style={{ fontSize: 16, padding: 10, fontWeight: "bold" }}>Čas spuštění budíku</Text>
        <View style={styles.buttonContainer}>
          <Button onPress={() => setShowAlarmTimer(true)} color="brown" title="Vybrat čas" />

        </View>

        {showAlarmTimer && (
          <DateTimePicker
            testID="dateTimePicker"
            value={alarmTime}
            mode='time'
            is24Hour={true}
            onChange={onAlarmTimeChange}

          />
        )}

        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="Zpět" color="gray" onPress={() => {

              let alarmTimeArray = props.alarm.alarmTime.split(":");
              let alarmDaysArray = props.alarm.alarmDays.split("");
              let alarmDaysNumberArray = [];

              alarmDaysArray.forEach(element => {
                alarmDaysNumberArray.push(parseInt(element));
              });

              alarmDaysNumberArray.unshift(-1)

              let alarmTimeHours = parseInt(alarmTimeArray[0]);
              let alarmTimeMinutes = parseInt(alarmTimeArray[1]);

              setAlarmTime(new Date(2020, 4, 12, alarmTimeHours, alarmTimeMinutes));
              setAlarmDays(alarmDaysNumberArray);
              setAlarmName(props.alarm.alarmName);
              setAlarmStatus(props.alarm.alarmActive == 0 ? false : true);
              setAlarmSong(props.alarm.songId);

              props.cancel()
            }} />
          </View>
          <View style={styles.button}>
            <Button title="Uložit" color="green" onPress={() => {
              if (alarmName == null || alarmName == "") {
                Alert.alert(
                  "Chyba",
                  "Popis budíku nesmí být prázdný",
                  [
                    { text: "OK", onPress: () => { } }
                  ]
                );
              }
              else if (alarmName.length > 15) {
                Alert.alert(
                  "Chyba",
                  "Popis budíku je příliš dlouhý",
                  [
                    { text: "OK", onPress: () => { } }
                  ]
                );
              }
              else if (alarmDays.length == 1) {
                Alert.alert(
                  "Chyba",
                  "Alespoň jeden den musí být vybraný",
                  [
                    { text: "OK", onPress: () => { } }
                  ]
                );
              }
              else {
                let shortenedAlarmTime = alarmTime.toLocaleTimeString().slice(0, 5);
                let filteredAlarmDays = alarmDays.filter(a => a != -1);
                let sortedAlarmDays = filteredAlarmDays.sort((a, b) => a - b);

                let stringAlarmDays = "";
                sortedAlarmDays.forEach(element => {
                  stringAlarmDays = stringAlarmDays.concat(element.toString())
                });

                let inputAlarmTime = shortenedAlarmTime.replace(/"/g, "'");

                let checkQuery = "(";

                for (let i = 0; i < stringAlarmDays.length; i++) {
                  if (i == stringAlarmDays.length - 1) {
                    checkQuery += `alarmDays LIKE '%${parseInt(stringAlarmDays.charAt(i))}%')`

                  }
                  else {
                    checkQuery += `alarmDays LIKE '%${parseInt(stringAlarmDays.charAt(i))}%' OR `
                  }
                }

                db.transaction(function (tx) {
                  tx.executeSql(
                    `SELECT * FROM alarms WHERE alarmTime = ? AND ${checkQuery} AND NOT alarmId = ?`,
                    [inputAlarmTime, props.alarm.alarmId],
                    (tx, results) => {
                      if (results.rows.length > 0) {
                        Alert.alert(
                          "Chyba",
                          "Riziko konfliktu, není možné mít dva a více budíků se stejným časem a zároveň se společným shodným dnem či dny",
                          [
                            { text: "OK", onPress: () => { } }
                          ]
                        );
                      }
                      else {
                        let data = { alarmActive: alarmStatus, alarmDays: stringAlarmDays, alarmTime: shortenedAlarmTime, alarmName: alarmName, songId: alarmSong, alarmId: props.alarm.alarmId };
                        props.edit(data);
                      }
                    }
                  );
                });

              }
            }
            } />
          </View>
        </View>

      </ScrollView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  input: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    margin: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: "space-around",
    width: '100%',
    marginTop: 10

  },
  switchContainer: {
    margin: 10,
    flexDirection: 'row',
    alignItems: "center"
  },
  button: {
    width: '40%'
  }
});

export default EditAlarm;