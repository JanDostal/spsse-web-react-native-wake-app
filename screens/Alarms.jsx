import SafeAreaView from 'react-native-safe-area-view';
import React, { useEffect, useState } from 'react';
import { View, Button, FlatList, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

import AddAlarm from '../components/AddAlarm';
import AlarmItem from '../components/AlarmItem';

var db = SQLite.openDatabase('awakeAlarmDatabase.db');

export const Alarms = ({ alarms, setAlarms, songs, setSongs }) => {

    const [isAddMode, setIsAddMode] = useState(false);

    const cancelAlarmAddition = () => {
        setIsAddMode(false);
    };

    const addAlarm = alarm => {

        let alarmName = alarm.alarmName.replace(/"/g, "'");
        let alarmDays = alarm.alarmDays.replace(/"/g, "'");
        let alarmTime = alarm.alarmTime.replace(/"/g, "'");

        db.transaction(function (tx) {
            tx.executeSql(
                "INSERT INTO alarms (alarmDays, alarmName, alarmActive, alarmTime, songId) VALUES (?,?,?,?,?)",
                [alarmDays, alarmName, alarm.alarmActive, alarmTime, alarm.songId],
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
                    if (results.rows.length > 0) {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        setSongs(temp);
                    }
                }
            );
        });

        setIsAddMode(false);
    }

    const removeAlarm = alarmId => {

        db.transaction(function (tx) {
            tx.executeSql(
                "DELETE FROM alarms WHERE alarmId = ?",
                [alarmId],
                (tx, results) => {

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

            tx.executeSql(
                "SELECT `songs`.*, (SELECT COUNT(*) FROM `alarms` WHERE `alarms`.`songId` = `songs`.`songId`) AS `alarmsCount` FROM `songs` ORDER BY `songs`.`songId` DESC",
                null,
                (tx, results) => {
                    if (results.rows.length > 0) {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        setSongs(temp);
                    }
                }
            );
        });


    };

    useEffect(() => {
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'",
                null,
                function (tx, res) {
                    if (res.rows.length == 0) {
                        txn.executeSql('DROP TABLE IF EXISTS songs', [], () => { });
                        txn.executeSql('DROP TABLE IF EXISTS alarms', [], () => { });
                        txn.executeSql(
                            `CREATE TABLE IF NOT EXISTS songs (
                                songId INTEGER PRIMARY KEY AUTOINCREMENT,
                                songName VARCHAR(255) NOT NULL, 
                                songLocation VARCHAR(255) NOT NULL,
                                songTime TIME NOT NULL
                            )`,
                            [],
                            () => { }
                        );
                        txn.executeSql(
                            `CREATE TABLE IF NOT EXISTS alarms (
                                alarmId INTEGER PRIMARY KEY AUTOINCREMENT,
                                alarmDays VARCHAR(7) NOT NULL,
                                alarmName VARCHAR(255) NOT NULL,
                                alarmActive BOOLEAN NOT NULL, 
                                alarmTime TIME NOT NULL, 
                                songId INTEGER DEFAULT NULL,
                                FOREIGN KEY (songId) 
                                REFERENCES songs(songId)
                                    ON DELETE SET NULL
                                    ON UPDATE CASCADE
                            )`,
                            [],
                            () => { },
                        );
                    }
                },
                () => { }
            );
        });


    }, []);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={{ padding: 10, margin: 10, width: "100%" }}>
                            <Button color="blue" title="Přidat budík" onPress={() => setIsAddMode(true)} />
                        </View>
                        <AddAlarm
                            visible={isAddMode}
                            onAdd={addAlarm}
                            onCancel={cancelAlarmAddition}
                            songs={songs}
                        />
                        <FlatList
                            keyExtractor={(item, index) => item.alarmId}
                            data={alarms}
                            renderItem={itemData => (
                                <AlarmItem
                                    onDelete={removeAlarm}
                                    item={itemData.item}
                                    setAlarms={setAlarms}
                                    setSongs={setSongs}
                                    songs={songs}
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

export default Alarms;