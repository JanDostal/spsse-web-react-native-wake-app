import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, Text, Alert } from 'react-native';

export const EditSong = props => {

  const [songName, setSongName] = useState(props.song.songName);

  const songNameInputHandler = enteredText => {
    setSongName(enteredText);
  };

  return (
    <Modal visible={props.isVisible} animationType="slide">
      <Text style={{ fontSize: 24, padding: 10 }}>Upravit písničku</Text>

      <View style={styles.inputContainer}>
        <Text style={{ fontSize: 16, padding: 10, marginTop: 10, fontWeight: "bold" }}>Název písničky</Text>

        <TextInput
          placeholder="Zadejte název"
          style={styles.input}
          onChangeText={songNameInputHandler}
          value={songName}
        />

        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="Zpět" color="gray" onPress={() => {
              setSongName(props.song.songName);
              props.cancel()

            }} />
          </View>
          <View style={styles.button}>
            <Button title="Uložit" color="green" onPress={() => {
              if (songName == null || songName == "") {
                Alert.alert(
                  "Chyba",
                  "Název písničky nesmí být prázdný",
                  [
                    { text: "OK", onPress: () => { } }
                  ]
                );
              }
              else {

                let data = { songId: props.song.songId, songName: songName };
                props.edit(data);
              }
            }

            } />
          </View>
        </View>
      </View>
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
  button: {
    width: '40%'
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  }
});

export default EditSong;