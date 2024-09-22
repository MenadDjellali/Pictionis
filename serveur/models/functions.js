const { db } = require ('../services/firebase');
const { getDocs, collection, addDoc, updateDoc, doc, arrayUnion, deleteDoc, getDoc, increment, query } = require('firebase/firestore')

const getRoom = async (roomID) => {
  const roomCollectionRef = collection(db, "rooms");
  try {
    const data = await getDocs(roomCollectionRef);
    const filteredData = data.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .filter((docData) => docData.roomID === roomID);
    console.log(filteredData)
    return filteredData
  } catch (error) {
    console.error(error)
  }
};

const roomCollectionRef = collection(db, "rooms");

const getData = async () => {
  try {
    const data = await getDocs(roomCollectionRef);
    const filterdData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    console.log(filterdData)
  } catch (error) {
    console.error(error)
  }
}

const createRoom = async (roomId, username) => {
  try {
    const roomRef = collection(db, "rooms");
    await addDoc(roomRef, {
      roomID: roomId,
      users: [],
      word: null,
      artistId: null,
      hasStarted: false,
      timer: null,
    });
    console.log(`${username} created ${roomId}`);
  } catch (error) {
    console.error("Error creating room:", error);
  }
};

const addUserToRoom = async (roomId, user) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);
    await updateDoc(roomRef, {
      users: arrayUnion(user),
    });
    console.log(`${user.username} joined ${roomId}`);
  } catch (error) {
    console.error("Error adding user to room:", error);
  }
};

const removeUserFromRoom = async (roomId, userId) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      console.log(`Room ${roomId} does not exist.`);
      return null;
    }

    // Retirer l'utilisateur de la liste des utilisateurs
    const updatedUsers = roomDoc.data().users.filter(user => user.id !== userId);

    // Mettre à jour la salle avec la nouvelle liste d'utilisateurs
    await updateDoc(roomRef, {
      users: updatedUsers,
    });

    console.log(`${userId} left ${roomId}`);

    // Si la salle est vide après le retrait de l'utilisateur, supprimez la salle
    if (updatedUsers.length === 0) {
      await deleteDoc(roomRef);
      console.log(`Deleted room ${roomId}`);
    }

    return roomDoc.data();
  } catch (error) {
    console.error("Error removing user from room:", error);
    return null;
  }
};

const startGame = async (roomId) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);

    // Mettre à jour la salle pour indiquer que le jeu a commencé
    await updateDoc(roomRef, {
      hasStarted: true,
    });

    return true; // Vous pouvez retourner une valeur pour indiquer que le jeu a été démarré avec succès
  } catch (error) {
    console.error("Error starting the game:", error);
    return false; // Indiquez qu'il y a eu une erreur lors du démarrage du jeu
  }
};

const updateWordAndArtistTurns = async (roomId, word, artistId) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);

    // Mettre à jour le mot et incrémenter les tours de l'artiste
    await updateDoc(roomRef, {
      word: word,
    });

    // Incrémenter les tours de l'artiste
    await updateDoc(roomRef, {
      users: arrayUnion({
        id: artistId,
        turns: 1,
      }),
    });

    return true; // Vous pouvez retourner une valeur pour indiquer que la mise à jour a réussi
  } catch (error) {
    console.error("Error updating word and artist turns:", error);
    return false; // Indiquez qu'il y a eu une erreur lors de la mise à jour
  }
};

const updateRoomTimerID = async (roomId, timerId) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);

    await updateDoc(roomRef, {
      timer: timerId,
    });

    return true; // Vous pouvez retourner une valeur pour indiquer que la mise à jour a réussi
  } catch (error) {
    console.error("Error updating word and artist turns:", error);
    return false; // Indiquez qu'il y a eu une erreur lors de la mise à jour
  }
};


// const increaseScore = async (roomID, userID, inc) => {
//   // Increments score of the given userID by "inc"
//   try {
//     const rooms = mongoClient.db("pictionary").collection("rooms");
//     const result = await rooms.findOneAndUpdate(
//       { _id: roomID },
//       { $inc: { "users.$[ele].score": inc } },
//       {
//         arrayFilters: [{ "ele.id": userID }],
//         returnOriginal: false,
//         new: true,
//         returnDocument: "after",
//       }
//     );
//     const index = result.value.users.findIndex((user) => user.id === userID);
//     return result.value.users[index];
//   } finally {
//   }
// };

const increaseScore = async (roomId, userId, inc) => {
  try {
    const room = getRoom(roomId)
    const roomRef = doc(db, "rooms", room.id);
    
    // Incrémenter le score de l'utilisateur
    await updateDoc(roomRef, {
      users: {
        [userId]: {
          score: increment(inc),
        },
      },
    });

    const roomDoc = await getDoc(roomRef);

    // Récupérer l'utilisateur mis à jour
    const updatedUsers = roomDoc.data().users;
    const user = updatedUsers.find((user) => user.id === userId);

    return user; // Vous pouvez retourner une valeur pour indiquer que la mise à jour a réussi
  } catch (error) {
    console.error("Error increasing score:", error);
    return false; // Indiquez qu'il y a eu une erreur lors de la mise à jour du score
  }
};

// const deleteRooms = async (roomID, all = false) => {
//   // ! Deletes all the rooms ! //
//   try {
//     const rooms = mongoClient.db("pictionary").collection("rooms");
//     if (all) {
//       console.log("Deleting all rooms in collection");
//       await rooms.deleteMany({});
//     } else {
//       await rooms.deleteOne({ _id: roomID });
//     }
//   } finally {
//   }
// };


const deleteRooms = async (roomID, all = false) => {
  try {
    const roomsCollection = collection(db, "rooms");

    const room = getRoom(roomID)
    roomID = room.id

    if (all) {
      console.log("Deleting all rooms in collection");
      
      // Récupérer toutes les salles et les supprimer une par une
      const querySnapshot = await getDocs(roomsCollection);
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });

      await Promise.all(deletePromises);
    } else {
      console.log(`Deleting room ${roomID}`);
      
      // Supprimer une salle spécifique par son ID
      const querySnapshot = await getDocs(query(roomsCollection, where("roomID", "==", roomID)));
      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
      }
    }
    
    return true; // Vous pouvez retourner une valeur pour indiquer que la suppression a réussi
  } catch (error) {
    console.error("Error deleting rooms:", error);
    return false; // Indiquez qu'il y a eu une erreur lors de la suppression des salles
  }
};

module.exports = {  getRoom,
  createRoom,
  addUserToRoom,
  removeUserFromRoom,
  startGame,
  updateWordAndArtistTurns,
  increaseScore,
  deleteRooms,
  updateRoomTimerID}