'use client';

import { useState, useRef, useEffect } from 'react';
import { firestore, storage } from '@/firebase'; // Make sure to set up storage in your firebase.js file
import { Box, Stack, Modal, Typography, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Add as AddIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { collection, deleteDoc, query, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Camera from 'react-camera-pro';

export default function Home() {
  const cameraRef = useRef(null);
  const [ppantry, setPpantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const updatePpantry = async () => {
    const snapshot = query(collection(firestore, 'ppantry'));
    const docs = await getDocs(snapshot);
    const ppantryList = [];

    docs.forEach((doc) => {
      ppantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });

    setPpantry(ppantryList);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'ppantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePpantry();
  };

  const addItem = async (item, imageUrl = '') => {
    const docRef = doc(collection(firestore, 'ppantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, imageUrl });
    } else {
      await setDoc(docRef, { quantity: 1, imageUrl });
    }

    await updatePpantry();
  };

  const handleCapture = () => {
    const photo = cameraRef.current.takePhoto();
    setImage(photo);
    setIsCameraOpen(false);
  };

  const handleUpload = async (itemName) => {
    if (!image) return;

    // Convert base64 to Blob
    const blob = await fetch(image).then(res => res.blob());

    const storageRef = ref(storage, `images/${itemName}`);
    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);

    await addItem(itemName, imageUrl);
    setImage(null);
  };

  useEffect(() => {
    updatePpantry();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setImage(null);
  };

  const filteredPantry = ppantry.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="#f0f0f0"
      p={4}
      sx={{
        backgroundImage: 'url("https://thumbs.dreamstime.com/b/vegetables-spices-ingredient-cooking-italian-food-black-wooden-old-board-rustic-style-76334485.jpg")', // Add your background image URL here
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Box
        width="100%"
        maxWidth="400px"
        display="flex"
        justifyContent="center"
        mb={4}
        bgcolor="#fff"
      >
        <TextField
          label="Search items"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add Item
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          left="50%"
          top="50%"
          width={400}
          bgcolor="rgba(0, 0, 0, 0.8)" // Dark background with opacity for better readability
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            borderRadius: 2,
            fontFamily: 'Arial, sans-serif',
            color: '#fff', // White text color
            zIndex: 1200, // Ensure the modal is on top
          }}
        >
          <Typography variant="h6" align="center">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
              InputProps={{
                style: { color: '#fff' }, // White text color
              }}
              InputLabelProps={{
                style: { color: '#fff' }, // White label color
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                if (image) {
                  handleUpload(itemName);
                } else {
                  addItem(itemName);
                }
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CameraAltIcon />}
            onClick={() => setIsCameraOpen(true)}
          >
            Capture Image
          </Button>
          {isCameraOpen && (
            <Box>
              <Camera ref={cameraRef} />
              <Button variant="contained" color="primary" onClick={handleCapture}>
                Capture
              </Button>
            </Box>
          )}
          {image && (
            <Box>
              <img src={image} alt="Captured" style={{ width: '100%' }} />
            </Box>
          )}
        </Box>
      </Modal>
      <Typography variant="h2" align="center" gutterBottom  bgcolor="#D8F9BC"     color="#000">Pantry Items</Typography>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        width="100%"
        maxWidth="600px"
      >
        {filteredPantry.map((item) => (
          <Box
            key={item.name}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            p={2}
            border="1px solid #ccc"
            borderRadius={4}
            bgcolor="#FCF3F0"
            boxShadow={2}
            sx={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#000', // White text color
            }}
          >
            <Typography variant="body1">{item.name}</Typography>
            <Typography variant="body1">{item.quantity}</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                color="error"
                onClick={() => removeItem(item.name)}
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => addItem(item.name)}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
