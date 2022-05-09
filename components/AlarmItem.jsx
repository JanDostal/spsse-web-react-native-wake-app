import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import EditAlarm from './EditAlarm';
import * as SQLite from 'expo-sqlite';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const AlarmItem = ({ onDelete, item, setAlarms, setSongs, songs }) => {

  const [isEditMode, setIsEditMode] = useState(false);

  const editAlarm = alarm => {

    let alarmName = alarm.alarmName.replace(/"/g, "'");
    let alarmDays = alarm.alarmDays.replace(/"/g, "'");
    let alarmTime = alarm.alarmTime.replace(/"/g, "'");

    db.transaction(function (tx) {
      tx.executeSql(
        "UPDATE alarms SET alarmDays = ?, alarmName = ?, alarmActive = ?, alarmTime = ?, songId = ? WHERE alarmId = ?",
        [alarmDays, alarmName, alarm.alarmActive, alarmTime, alarm.songId, alarm.alarmId],
        (tx, results) => { }
      );
      tx.executeSql(
        'SELECT alarms.*, songs.songName FROM alarms LEFT JOIN songs ON alarms.songId = songs.songId ORDER BY alarms.alarmId DESC',
        null,
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setAlarms(temp);
        }
      );
      tx.executeSql(
        "SELECT `songs`.*, (SELECT COUNT(*) FROM `alarms` WHERE `alarms`.`songId` = `songs`.`songId`) AS `alarmsCount` FROM `songs` ORDER BY `songs`.`songId` DESC",
        null,
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setSongs(temp);
        }
      );
    });

    setIsEditMode(false);
  }

  const cancelAlarmEditation = () => {
    setIsEditMode(false);
  };

  let chosenAlarmDays = "";
  let chosenAlarmDayexception = "";

  for (var i = 0; i < item.alarmDays.length; i++) {
    let day;
    switch (item.alarmDays.charAt(i)) {

      case "2":
        day = "po";

        break;

      case "3":
        day = "út";

        break;

      case "4":
        day = "st";

        break;

      case "5":
        day = "čt";

        break;

      case "6":
        day = "pá"
        break;

      case "7":
        day = "so";
        break;
      default:
        chosenAlarmDayexception = "ne"
        break;
    }

    if (i == item.alarmDays.length - 1 && item.alarmDays.charAt(i) != "1") {
      chosenAlarmDays += `${day}`

    }
    else if (item.alarmDays.charAt(i) != "1") {
      chosenAlarmDays += `${day}, `
    }
  }

  if (chosenAlarmDayexception != "" && item.alarmDays.length > 1) {
    chosenAlarmDays += `, ${chosenAlarmDayexception}`
  }
  else if (chosenAlarmDayexception != "" && item.alarmDays.length == 1) {
    chosenAlarmDays += `${chosenAlarmDayexception}`

  }

  return (
    <View style={styles.listItem}>
      <View style={styles.Container}>
        <Text style={{ fontSize: 40 }}>{item.alarmTime}</Text>
        <Text style={{ marginLeft: 60, fontSize: 20, flexWrap: "wrap", flex: 1, fontWeight: "bold" }}>{item.alarmName}</Text>

      </View>

      <View style={styles.Container}>
        <Text style={{ fontSize: 20 }}>Dny: </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{chosenAlarmDays}</Text>

      </View>

      <View style={styles.Container}>
        <Text style={{ fontSize: 20 }}>Písnička: </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: item.songName == null ? "red" : "black" }}>{item.songName == null ? "Žádná" : item.songName.length > 20 ? item.songName.substring(0, 20) + "..." : item.songName}</Text>

      </View>
      <View style={styles.Container2}>
        <Text style={{ fontSize: 20 }}>Status: </Text>
        <View style={{
          width: 25,
          height: 25,
          borderRadius: 60 / 2,
          backgroundColor: item.alarmActive == 1 ? 'green' : 'red',
          borderColor: 'black',
          borderWidth: 3
        }}>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="Upravit" color="green" onPress={() => setIsEditMode(true)} />
          </View>
          <View style={styles.button}>
            <Button title="Smazat" color="red" onPress={() => onDelete(item.alarmId)} />
          </View>

        </View>

        <EditAlarm
          isVisible={isEditMode}
          edit={editAlarm}
          cancel={cancelAlarmEditation}
          alarm={item}
          songs={songs}
        />

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    width: 350,
    backgroundColor: '#ccc',
    borderColor: 'black',
    borderWidth: 2
  },
  Container: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "flex-start",
    width: '100%'
  },
  Container2: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "flex-start",
    width: '100%',
    marginTop: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '70%'
  },
  button: {
    width: '40%'
  }
});

export default AlarmItem;