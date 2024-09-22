import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image, ScrollView, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import ColorPalette from 'react-native-color-palette'
import { XMarkIcon } from 'react-native-heroicons/outline';
import io from 'socket.io-client';

import { Path, Svg } from 'react-native-svg';
import Modal from 'react-native-modal';
import { socket } from '../service/socket';

const { height, width } = Dimensions.get('window');

const DrawingCanvasScreen = ({ navigation, route }) => {
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [isWidthPickerVisible, setWidthPickerVisible] = useState(false);
  const [isEraser, setEraser] = useState(false);
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const [chatInput, setChatInput] = useState(''); // État pour la zone de texte de chat
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [paths, setPaths] = useState([]);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [roomId, setRoomId] = useState();
  const [roomOwner, setroomOwner] = useState();
  const [word, setWord] = useState();
  const [username, setUsername] = useState('')
  const [guessWordInput, setguessWordInput] = useState()
  const [finishGame, setFinishGame] = useState(false)

  useEffect(() => {
    setUsername(route.params.username)
    setroomOwner(route.params.roomOwner)
    setWord(route.params.word)
    socket.on('draw', (data) => {
      if (Array.isArray(data)) {

        const newPathsData = data.map((newPath) => {
          return {
            path: newPath.path, // Les données de dessin reçues du serveur
            color: newPath.color, // La couleur du dessin reçue du serveur
            width: newPath.width, // La largeur du dessin reçue du serveur
          };
        });
        setPaths([...paths, ...newPathsData]);
      } else {
        const newPathData = {

          path: data.path, // Les données de dessin reçues du serveur
          color: data.color, // La couleur du dessin reçue du serveur
          width: data.width, // La largeur du dessin reçue du serveur
        };

        setPaths([...paths, newPathData]);
      }

    });
    socket.on('drawingDeleted', (data) => {
      setPaths([]);
    });
    socket.emit('ROOM_EXISTS');
    socket.on('Message', (data) => {
      setChatMessages([...data]);
    });
    socket.on('Game', (data) => {
      setFinishGame(data);
    });
  }, []);

  useEffect(() => {
    socket.on('EXISTING_ROOM', (data) => {
      setWord(data.word)
      setroomOwner(data.username)
    });
  }, [socket])

  const showColorPicker = () => {
    setColorPickerVisible(true);
  };

  const hideColorPicker = () => {
    setColorPickerVisible(false);
  };

  const showWidthPicker = () => {
    setWidthPickerVisible(true);
  };

  const hideWidthPicker = () => {
    setWidthPickerVisible(false);
  };

  const clearDrawing = () => {
    setPaths([]);
    socket.emit('deleteDrawing', { drawingId: 'delete' });
  };

  const toggleEraser = () => {
    setEraser(!isEraser);
  };

  const showChatModal = () => {
    setChatModalVisible(true);
  };

  const hideChatModal = () => {
    setChatModalVisible(false);
  };

  const sendChatMessage = () => {
    if (chatInput.trim() !== '') {
      const newMessage = {
        text: chatInput,
        sender: username, // Vous pouvez personnaliser l'émetteur
      };
      setChatMessages([...chatMessages, newMessage]);
      socket.emit('chatMessage', [...chatMessages, newMessage]);
      setChatInput(''); // Effacez le champ de texte après avoir envoyé le message
    }
  };

  const tryGuess = () => {
    if (guessWordInput === word) {
      socket.emit('gameState', true)
      setFinishGame(true)
      return
    }
    setguessWordInput('')
  }

  const colors = [
    '#C0392B',
    '#E74C3C',
    '#FF5733',
    '#E67E22',
    '#F39C12',
    '#F1C40F',
    '#7CC42F',
    '#78C42F',
    '#2FC45C',
    '#2FC44D',
    '#2FC473',
    '#2FC4BE',
    '#2F85C4',
    '#2F4DC4',
    '#3498DB',
    '#9B59B6',
    '#8E44AD',
    '#2980B9',
    '#2C3E50',
    '#34495E',
    '#95A5A6',
    '#7F8C8D',
    '#ECF0F1',
    '#BDC3C7',
  ]

  const onTouchMove = (event) => {
    if (roomOwner && username !== roomOwner) return
    const newPath = [...currentPath];
    const locationX = event.nativeEvent.locationX;
    const locationY = event.nativeEvent.locationY;
    const newPoint = `${newPath.length === 0 ? 'M' : ''}${locationX.toFixed(0)},${locationY.toFixed(0)} `;
    newPath.push(newPoint);
    setCurrentPath(newPath);
    if (isEraser) {
      // Utiliser la couleur blanche pour la gomme
      setSelectedColor('#FFFFFF');
    } else {
      setSelectedColor(selectedColor);
    }

    if (currentPath.length > 0) {
      const newPathData = {
        path: currentPath,
        color: selectedColor,
        width: selectedWidth,
      };
      setPaths([...paths, newPathData]);
      if (paths.length === 0) {
        socket.emit('draw', newPathData);
      } else {
        socket.emit('draw', paths);
      }
    }

  };

  const onTouchEnd = () => {
    setCurrentPath([]);
    setSelectedColor(isEraser ? 'black' : selectedColor);
  };

  const generateUnderscores = (word) => {
    // Remplace chaque lettre par un underscore en conservant les espaces et autres caractères.
    if (word) return word.replace(/[a-zA-Z]/g, '_ ').replace(/-/g, '-');
  }

  return (
    <View style={styles.container}>
      {(roomOwner && username === roomOwner) ? (
        <View style={{ marginBottom: 10, alignItems: 'center' }}><Text style={{ fontSize: 25, fontWeight: 'bold' }}>{word}</Text></View>
      ) :
        (
          <View style={{ marginBottom: 10, alignItems: 'center' }}><Text style={{ fontSize: 25, fontWeight: 'bold' }}>{generateUnderscores(word)}</Text></View>
        )}

      <View style={styles.svgContainer} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Svg height={height * 0.7} width={width}>
          {paths.map((pathData, index) => (
            <Path
              key={index}
              d={pathData.path.join('')}
              stroke={pathData.color}
              fill="transparent"
              strokeWidth={pathData.width}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          <Path d={currentPath.join('')} stroke={selectedColor} fill="transparent" strokeWidth={selectedWidth} strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      </View>
      {(roomOwner && username === roomOwner) ? (
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
            <TouchableOpacity onPress={clearDrawing}>
              <Image source={require('../assets/delete-icon.png')} style={{ width: 37, height: 37, marginRight: 20 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleEraser}>
              <Image source={require('../assets/eraser-icon.png')} style={{ width: isEraser ? 50 : 42, height: isEraser ? 50 : 42 }} />
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity onPress={showChatModal}>
              <Image source={require('../assets/chat-icon.png')} style={{ width: 45, height: 45 }} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <TouchableOpacity onPress={showWidthPicker}>
              <Image source={require('../assets/width-icon.png')} style={{ width: 40, height: 40 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={showColorPicker}>
              <Image source={require('../assets/paint-icon.png')} style={{ width: 55, height: 55, marginLeft: 20 }} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <TextInput
              value={guessWordInput}
              onChangeText={text => setguessWordInput(text)}
              placeholder="Entrez un mot"
              style={styles.chatInput}
            />
            <TouchableOpacity onPress={tryGuess}>
              <Image source={require('../assets/send-icon.png')} style={{ width: 40, height: 40 }} />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={showChatModal}>
              <Image source={require('../assets/chat-icon.png')} style={{ width: 45, height: 45 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal isVisible={isColorPickerVisible}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#0782F9' }}>Sélectionner la couleur :</Text>
          <ColorPalette
            onChange={color => setSelectedColor(color)}
            defaultColor={'#C0392B'}
            colors={colors}
          />
          <TouchableOpacity onPress={hideColorPicker}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0782F9' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={isWidthPickerVisible}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#0782F9' }}>Ajuster la largeur du trait :</Text>
          <Slider
            style={{ width: '100%' }}
            step={1}
            minimumValue={1}
            maximumValue={15}
            value={selectedWidth}
            onValueChange={(value) => setSelectedWidth(value)}
          />
          <TouchableOpacity onPress={hideWidthPicker}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0782F9' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Modal de chat */}
      <Modal visible={isChatModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalChatContainer}>

          <ScrollView>
            {chatMessages.map((message, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: message.sender === username ? '#0782F9' : '#E5E7E6',
                  padding: 5,
                  borderRadius: 10,
                  margin: 5,
                  marginLeft: message.sender === username ? 100 : 0,
                  marginRight: message.sender === username ? 0 : 100,
                  width: width*0.68,
                  alignItems: message.sender === username ? 'flex-end' : 'flex-start',
                  elevation: 5,
                  paddingHorizontal:15,
                }}
              >
                <Text style={{
                color: message.sender === username ? 'white' : 'black',
              }}>
                {`${message.text}`}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <TextInput
              value={chatInput}
              onChangeText={text => setChatInput(text)}
              placeholder="Entrez votre message"
              style={styles.chatInput}
            />
            <TouchableOpacity onPress={sendChatMessage}>
              <Image source={require('../assets/send-icon.png')} style={{ width: 40, height: 40 }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              borderRadius: 100,
            }}
            onPress={hideChatModal}
          >
            <XMarkIcon size={22} color="white"></XMarkIcon>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Finish game Modal */}
      <Modal isVisible={finishGame}>
        <View style={styles.finishContainer}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              borderRadius: 100,
            }}
            onPress={() => {
              navigation.navigate('Home')
            }}
          >
            <XMarkIcon size={20} color="white"></XMarkIcon>
          </TouchableOpacity>
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#0782F9' }}>
            Bravo !
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  svgContainer: {
    height: height * 0.7,
    width,
    borderRadius: 5,
    borderColor: '#0782F9',
    backgroundColor: 'white',
    borderWidth: 2,
    marginRight: 2
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
  },
  modalChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#0782F9',
    borderRadius: 5,
    elevation: 5,
    marginVertical: 45
  },
  finishContainer: {
    // flex: 1,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#0782F9',
    borderRadius: 5,
    elevation: 5,
    marginVertical: 45
  },
  chatInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: '#0782F9',
    borderWidth: 1.5,
  },
});

export default DrawingCanvasScreen;
