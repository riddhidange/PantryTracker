'use client';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Stack, TextField, Typography, Button } from '@mui/material';
import { collection, getDoc, query, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { modalStyle, buttonStyle, headerStyle, itemBoxStyle } from './style';

export default function Home() {
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const updateInventory = async () => {
        const snapshot = query(collection(firestore, 'inventory'));
        const docs = await getDocs(snapshot);
        const inventoryList = [];
        docs.forEach((doc) => {
            inventoryList.push({
                name: doc.id,
                ...doc.data(),
            });
        });
        setInventory(inventoryList);
    };

    useEffect(() => {
        updateInventory();
    }, []);

    const addItem = async (name) => {
        const docRef = doc(collection(firestore, 'inventory'), name);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentQuantity = data.quantity || 0;
            await setDoc(docRef, { quantity: currentQuantity + 1, category: itemCategory || '', expirationDate: expirationDate || '' });
        } else {
            await setDoc(docRef, { quantity: quantity, category: itemCategory, expirationDate });
        }
        await updateInventory();
        handleClose();
    };

    const removeItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentQuantity = data.quantity || 0;
            if (currentQuantity <= 1) {
                await deleteDoc(docRef);
            } else {
                await setDoc(docRef, { quantity: currentQuantity - 1, category: data.category, expirationDate: data.expirationDate });
            }
        }
        await updateInventory();
    };

    const deleteItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await deleteDoc(docRef);
        }
        await updateInventory();
    };

    const handleOpen = () => {
        setEditMode(false);
        setOpen(true);
        setItemName('');
        setItemCategory('');
        setExpirationDate('');
        setQuantity(0);
        setEditingItem(null);
    };

    const handleEdit = (item) => {
        setEditMode(true);
        setOpen(true);
        setItemName(item.name);
        setItemCategory(item.category || '');
        setExpirationDate(item.expirationDate || '');
        setQuantity(item.quantity || 0);
        setEditingItem(item.name);
    };

    const handleSave = async () => {
        if (editingItem) {
            const docRef = doc(collection(firestore, 'inventory') );
            await setDoc(docRef, { quantity, category: itemCategory || '', expirationDate: expirationDate || '' });
        } else {
            await addItem(itemName);
        }
        await updateInventory();
        handleClose();
    };

    const handleClose = () => setOpen(false);

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={2}
            gap={2}
        >
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        {editMode ? 'Edit Food Item' : 'Add New Food Item'}
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Item Name"
                            variant="outlined"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            fullWidth
                            disabled={editMode} 
                        />
                        <TextField
                            label="Category"
                            variant="outlined"
                            value={itemCategory}
                            onChange={(e) => setItemCategory(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Expiration Date"
                            type="date"
                            variant="outlined"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            variant="outlined"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={buttonStyle}
                        >
                            {editMode ? 'Save Changes' : 'Add'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            <Box
                width="100%"
                maxWidth="800px"
                border="1px solid #ddd"
                borderRadius="8px"
                overflow="hidden"
            >
                <Box sx={headerStyle}>
                    <Typography variant="h4" color="text.primary" align="center">
            Food Pantry
                    </Typography>
                </Box>
                <TextField
                    label="Search Pantry"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Stack spacing={2} p={2} overflow="auto">
                    {inventory
                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(({ name, quantity, category, expirationDate }) => (
                            <Box key={name} sx={itemBoxStyle}>
                                <Typography variant="h6" color="text.primary">
                                    {name.charAt(0).toUpperCase() + name.slice(1)}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                  Quantity: {quantity || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                  Category: {category || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                  Expiry: {expirationDate || 'N/A'}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleEdit({ name, quantity, category, expirationDate })}
                                        sx={buttonStyle}
                                    >
                    Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => addItem(name)}
                                        sx={buttonStyle}
                                    >
                    +
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => removeItem(name)}
                                        sx={buttonStyle}ad
                                    >
                    -
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => deleteItem(name)}
                                        sx={buttonStyle}ad
                                    >
                    Delete
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                </Stack>
            </Box>
            <Button variant="contained" onClick={handleOpen} sx={buttonStyle}>
        Add New Food Item
            </Button>
        </Box>
    );
}
