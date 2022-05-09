import React, { useState } from 'react';
import { View, Text, StyleSheet, Button} from 'react-native';

import EditSong from './EditSong';

import * as SQLite from 'expo-sqlite';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const SongItem = ({ onDelete, item, sound, setAlarms, setSongs, setChosenPlayingSong, chosenPlayingSong }) => {

  const [isEditMode, setIsEditMode] = useState(false);

  const editSong = song => {
    let songName = song.songName.replace(/"/g, "'");

    db.transaction(function (tx) {
      tx.executeSql(
        "UPDATE songs SET songName = ? WHERE songId = ?",
        [songName, song.songId],
        (tx, results) => {
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
    });

    setIsEditMode(false);
  }

  const cancelSongEditation = () => {
    setIsEditMode(false);
  };

  return (
    <View style={styles.listItem}>
      <View style={styles.Container}>
        <Text style={{ fontSize: 15 }}>Název: </Text>
        <Text style={{ fontSize: 15, fontWeight: "bold", flexWrap: "wrap", flex: 1 }}>{item.songName}</Text>

      </View>

      <View style={styles.Container}>
        <Text style={{ fontSize: 15 }}>Doba: </Text>
        <Text style={{ fontSize: 15, fontWeight: "bold" }}>{item.songTime}</Text>

      </View>

      <View style={styles.Container}>
        <Text style={{ fontSize: 15 }}>Počet používaných budíků: </Text>
        <Text style={{ fontSize: 15, fontWeight: "bold" }}>{item.alarmsCount}</Text>

      </View>

      <View style={styles.Container2}>

        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title={chosenPlayingSong == item.songId ? "Zastavit" : "Přehrát"}
              disabled={chosenPlayingSong != item.songId && chosenPlayingSong != null ? true : false}
              color={chosenPlayingSong == item.songId ? "orange" : "blue"} onPress={async () => {
                if (chosenPlayingSong == item.songId) {
                  setChosenPlayingSong(null);
                  await sound.unloadAsync();
                }
                else if (chosenPlayingSong == null) {
                  setChosenPlayingSong(item.songId);
                  await sound.loadAsync({ uri: item.songLocation },
                    {
                      isLooping: true
                    });

                  await sound.playAsync();
                }
              }} />
          </View>

          <View style={styles.button}>
            <Button title="Upravit" color="green" onPress={() => setIsEditMode(true)} />
          </View>
          <View style={styles.button}>

            <Button title="Smazat" color="red" onPress={async () => {
              let status = await sound.getStatusAsync();
              if (status.isLoaded == true && chosenPlayingSong == item.songId) {
                setChosenPlayingSong(null);
                await sound.unloadAsync();
              }
              onDelete(item.songId)
            }
            } />
          </View>
        </View>

        <EditSong
          isVisible={isEditMode}
          edit={editSong}
          cancel={cancelSongEditation}
          song={item}
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
    alignItems: "flex-start",
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
    justifyContent: 'space-around',
    width: '100%'
  },

  button: {
    width: '30%'
  }
});

export default SongItem;