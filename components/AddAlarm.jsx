import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Switch, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DayPicker } from 'react-native-picker-weekday'
import * as SQLite from 'expo-sqlite';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const AddAlarm = props => {

  const [alarmName, setAlarmName] = useState('');
  const [alarmSong, setAlarmSong] = useState(null);
  const [alarmStatus, setAlarmStatus] = useState(false);
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

  return (
    <Modal visible={props.visible} animationType="slide">
      <ScrollView>
        <Text style={{ fontSize: 24, padding: 10 }}>Přidání budíku</Text>

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
          <Button onPress={() => setShowAlarmTimer(true)} title="Vybrat čas" color="brown" />

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
            <Button title="Zpět" color="gray" onPress={
              props.onCancel
            } />
          </View>
          <View style={styles.button}>
            <Button title="Přidat" color="blue" onPress={() => {
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
                    `SELECT * FROM alarms WHERE alarmTime = ? AND ${checkQuery}`,
                    [inputAlarmTime],
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
                        let data = { alarmActive: alarmStatus, alarmDays: stringAlarmDays, alarmTime: shortenedAlarmTime, alarmName: alarmName, songId: alarmSong };
                        setAlarmTime(new Date(1598051730000));
                        setAlarmName('');
                        setAlarmStatus(false);
                        setAlarmSong(null);
                        setAlarmDays([-1]);
                        props.onAdd(data);
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

export default AddAlarm;