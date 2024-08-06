'use client'
import { useState, useEffect } from "react"
import { firestore } from "@/firebase"
import { Box, Modal, Stack, TextField, Typography, Button } from "@mui/material"
import { collection, getDoc, query, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore"

// Define styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const headerStyle = {
  backgroundColor: '#ADD8E6',
  padding: '16px',
  borderRadius: '8px',
}

const itemBoxStyle = {
  minHeight: '100px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderRadius: '8px',
  bgcolor: '#f0f0f0',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}

const buttonStyle = {
  borderRadius: '8px',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [editingItem, setEditingItem] = useState(null)
  const [filteredInventory, setFilteredInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredInventory(inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setFilteredInventory(inventory)
    }
  }, [searchQuery, inventory])

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      const currentQuantity = data.quantity || 0
      await setDoc(docRef, { quantity: currentQuantity + quantity, category: itemCategory || '', expirationDate: expirationDate || '' })
    } else {
      await setDoc(docRef, { quantity: quantity, category: itemCategory, expirationDate })
    }
    await updateInventory()
    handleClose()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      const currentQuantity = data.quantity || 0
      if (currentQuantity <= 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: currentQuantity - 1, category: data.category, expirationDate: data.expirationDate })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => {
    setEditMode(false)
    setOpen(true)
    setItemName('')
    setItemCategory('')
    setExpirationDate('')
    setQuantity(0)
    setEditingItem(null)
  }

  const handleEdit = (item) => {
    setEditMode(true)
    setOpen(true)
    setItemName(item.name)
    setItemCategory(item.category || '')
    setExpirationDate(item.expirationDate || '')
    setQuantity(item.quantity || 0)
    setEditingItem(item.name)
  }

  const handleSave = async () => {
    if (editingItem) {
      // Update existing item
      const docRef = doc(collection(firestore, 'inventory'), editingItem)
      await setDoc(docRef, { quantity, category: itemCategory || '', expirationDate: expirationDate || '' })
    } else {
      // Add new item
      await addItem()
    }
    await updateInventory()
    handleClose()
  }

  const handleClose = () => setOpen(false)

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
              disabled={editMode} // Prevent editing item name while in edit mode
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
      <TextField
        label="Search Inventory"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleOpen} sx={buttonStyle}>
        Add New Food Item
      </Button>
      <Box
        width="100%"
        maxWidth="800px"
        border="1px solid #ddd"
        borderRadius="8px"
        overflow="hidden"
      >
        <Box sx={headerStyle}>
          <Typography variant="h4" color="text.primary" align="center">
            Food Inventory
          </Typography>
        </Box>
        <Stack spacing={2} p={2} overflow="auto">
          {filteredInventory.map(({ name, quantity, category, expirationDate }) => (
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
                  variant="outlined"
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
                  Add
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)}
                  sx={buttonStyle}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
