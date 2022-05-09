import SafeAreaView from 'react-native-safe-area-view';
import React from 'react';
import { View, Button, FlatList, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import SongItem from '../components/SongItem';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const Songs = ({ sound, songs, setSongs, setAlarms, chosenPlayingSong, setChosenPlayingSong }) => {

    const removeSong = songId => {

        db.transaction(function (tx) {
            tx.executeSql(
                "DELETE FROM songs WHERE songId = ?",
                [songId],
                (tx, results) => { }
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
                    if (results.rows.length > 0) {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        setAlarms(temp);
                    }
                }
            );
        });

    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={{ padding: 10, margin: 10, width: "100%" }}>
                            <Button color="blue" title="Přidat písničku" onPress={async () => {

                                let options = {
                                    type: "audio/mpeg",
                                    copyToCacheDirectory: false,
                                };

                                let originalAudio = await DocumentPicker.getDocumentAsync(options);
                                if (originalAudio.uri != null) {

                                    let soundStatus = await sound.getStatusAsync();
                                    if (soundStatus.isLoaded == true) {

                                        setChosenPlayingSong(null);
                                        await sound.unloadAsync();
                                    }

                                    await FileSystem.copyAsync({ from: originalAudio.uri, to: FileSystem.documentDirectory + originalAudio.name });

                                    let newAudio = await FileSystem.getInfoAsync(FileSystem.documentDirectory + originalAudio.name);

                                    let finalAudio = newAudio.uri.split("file://")[1];

                                    let status = await sound.loadAsync({ uri: finalAudio }, { shouldPlay: false });

                                    let audioDate = new Date(status.durationMillis);
                                    let audioMinutes = audioDate.getUTCMinutes().toString();
                                    let audioSeconds = audioDate.getUTCSeconds().toString();
                                    let audioHours = audioDate.getUTCHours().toString();


                                    if (audioMinutes.length == 1) {
                                        audioMinutes = "0" + audioMinutes;
                                    }

                                    if (audioSeconds.length == 1) {
                                        audioSeconds = "0" + audioSeconds;
                                    }

                                    if (audioHours.length == 1) {
                                        audioHours = "0" + audioHours;
                                    }

                                    let audioTime = audioHours + ":" + audioMinutes + ":" + audioSeconds;

                                    let inputTime = audioTime.replace(/"/g, "'");
                                    let inputName = originalAudio.name.replace(/"/g, "'");

                                    db.transaction(function (tx) {
                                        tx.executeSql(
                                            "INSERT INTO songs (songName, songLocation, songTime) VALUES (?,?,?)",
                                            [inputName, finalAudio, inputTime],
                                            (tx, results) => { }
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

                                    await sound.unloadAsync();
                                }
                            }} />
                        </View>

                        <FlatList
                            keyExtractor={(item, index) => item.songId}
                            data={songs}
                            renderItem={itemData => (
                                <SongItem
                                    onDelete={removeSong}
                                    item={itemData.item}
                                    sound={sound}
                                    setAlarms={setAlarms}
                                    setSongs={setSongs}
                                    setChosenPlayingSong={setChosenPlayingSong}
                                    chosenPlayingSong={chosenPlayingSong}
                                />
                            )}
                        />

                    </View>
                </View>
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Songs;