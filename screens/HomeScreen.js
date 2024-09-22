import { useNavigation } from '@react-navigation/core'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { socket } from '../service/socket'
import { mots } from '../word'

const HomeScreen = () => {
  const navigation = useNavigation()

  const [roomId, setRoomId] = useState();
  const [username, setUsername] = useState();
  const [roomExists, setRoomExists] = useState();
  const [word, setWord] = useState(mots[Math.floor(Math.random() * mots.length)]);

  useEffect(() => {
    socket.on('CREATE_ROOM', (data) => {
      setRoomExists(data.roomId)
    });
  }, [socket]);

  const createRoom = () => {
    if (!roomExists) {
      socket.emit('CREATE_ROOM', { roomId: roomId, username, word });
      // socket.emit('ROOM_EXISTS', { roomId: roomId, username, word });
      navigation.navigate('DrawingCanvas', {
        username,
        roomId: roomId,
        word,
        roomOwner:username,
      });
    }
  };

  const joinRoom = () => {
    if (roomExists) {
      navigation.navigate('DrawingCanvas', {
        username,
        roomId: roomId,
      });
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Text>Email: {auth?.currentUser?.email}</Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 100 }}>
        <Text style={styles.textLabels}>Inserez votre pseudo</Text>
        <TextInput
          style={{
            letterSpacing: 2,
            fontSize: 20,
            textAlign: 'center',
          }}
          placeholder={'Pseudo'}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View>
        <Text style={styles.textLabels}>Rejoindre/Créer une partie</Text>
        <TextInput
          style={{
            letterSpacing: 5,
            fontSize: 20,
            textAlign: 'center',
          }}
          inputMode='numeric'
          maxLength={4}
          placeholder={'numéro'}
          onChangeText={(text) => setRoomId(`ROOM#${text}`)}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity style={styles.button} onPress={joinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={createRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
        </View>
        {roomId && roomExists === roomId && (
          <Text style={styles.errorText}>La salle existe déjà, pensez à la rejoindre</Text>
        )}
      </View>
    </View>
  );
}

export default HomeScreen

const styles = StyleSheet.create({
  textLabels: { fontSize: 25, fontWeight: 'bold' },
  button: {
    padding: 10,
    color: 'white',
    backgroundColor: '#0782F9',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: 'white' },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
});
