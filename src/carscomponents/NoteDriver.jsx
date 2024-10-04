import React, { useState, useEffect } from "react";
import { DownCircleOutlined } from '@ant-design/icons';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@nextui-org/react';
import { useCars,useDrivers } from '../CarDriver';
import { Input, Alert } from 'antd';
import dayjs from 'dayjs'; // Import dayjs for date manipulation
import relativeTime from 'dayjs/plugin/relativeTime';
import {EditIcon} from "./EditIcon";
dayjs.extend(relativeTime);
const { TextArea } = Input;

function NoteDriver({ theme, driver: propDriver, onDriverUpdate }) {
  const [driver, setDriver] = useState(propDriver);
  const [newNoteContent, setNewNoteContent] = useState('');
  const isDarkMode = theme === 'dark';
 
  
  // Add the state definition
  const [sortedNotes, setSortedNotes] = useState([]);

  const [editingNoteId, setEditingNoteId] = useState(null); 
  useEffect(() => {
    setSortedNotes([...driver.notes].sort((b, a) => new Date(a.creatingDate) - new Date(b.creatingDate)));
  }, [driver.notes,driver]);
  
  console.log("editingNoteId",editingNoteId)
  console.log("sortedNotes",sortedNotes)
  const [editedContent, setEditedContent] = useState(''); // Store edited content
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false); 
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { cars, refreshCars } = useCars();
  const { drivers, refreshDrivers } = useDrivers();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);
 
  const fetchUsers = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev);
  };

  useEffect(() => {
    if (errorMessage) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setErrorMessage('');
      }, 4000);
  
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  const handleEdit = (note) => {
    setEditingNoteId(note._id);
    setEditedContent(note.content); // Pre-fill with existing content
  };

  const handleSave = async (note) => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/notes/${editingNoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedContent,
          creator: username,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
  
      const updatedNote = await response.json(); // Assuming the API returns the updated note
      const updatedDriver= updatedNote.driver
      // Update the specific note in the driver.notes array
      setDriver(updatedDriver);
  
      setEditingNoteId(null);
      setEditedContent('');
    } catch (error) {
      console.error(error);
    }
  };
  
    const handleAddNote = async () => {
      const token = localStorage.getItem('userToken');
      const username = localStorage.getItem('username');
     
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newNoteContent,
            creatingDate: new Date(),
            creator: username,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add note');
        }
    
        const updatedNote = await response.json(); // Assuming the API returns the updated note
      const updatedDriver= updatedNote.driver
      // Update the specific note in the driver.notes array
      setDriver(updatedDriver);
        setIsAccordionOpen(false);
        setNewNoteContent('');
      } catch (error) {
        console.error(error);
      }
    };
    

  
  const handleCancel = () => {
    setEditingNoteId(null); // Exit edit mode without saving
  };
  useEffect(() => {
    refreshDrivers();
    console.log("runnniiiiing")
  }, [editingNoteId]);

  return (
    <div className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 w-72 transition-transform animate-slide-in-right">
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => {
              setShowAlert(false);
              setErrorMessage('');
            }}
          />
        </div>
      )}
      <Button onClick={toggleAccordion} size="sm" radius="sm" className={` ${isAccordionOpen ? "bg-cyan-900" : "bg-cyan-600"} text-white flex items-center`}>
        <DownCircleOutlined className={`mr-0 transition-transform ${isAccordionOpen ? 'rotate-0' : 'rotate-180'}`} />
        {isAccordionOpen ? 'Create New Note' : 'Create New Note'}
      </Button>

      <div className={`w-full mt-1 mb-2 overflow-hidden transition-all ${isAccordionOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="relative p-4 border border-gray-300 rounded-md space-y-4">
          <div className="flex flex-row space-x-1">
            <div className='w-5/6'>
              <TextArea
                className="shadow-md"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Note content"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </div>
            <div className="w-1/6">
              <Button onClick={handleAddNote} size="sm" radius="sm" className="ml-9 bg-cyan-500 text-white">
                Create Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
      {sortedNotes.map(note => {
        const creatorName = users.find(user => user._id === note.creator)?.username || 'Unknown User';
        const isEditing = editingNoteId === note._id;

        return (
          <Card key={note._id} isHoverable variant="shadow" style={{marginLeft:"25px", marginRight:"25px",marginBottom: '15px', display: 'flex' }}>
            {/* CardHeader with Creator's Name */}
            <CardHeader className="text-xs" style={{ backgroundColor: '#FFF6D6', padding: '4px',justifyContent:"flex-end" }}>
              <div className="mr-3 flex flex-end text-slate-400">Created by: {note.creator} -{dayjs(note.creatingDate).format('DD MMM HH:mm')}</div>
            </CardHeader>

            <CardBody style={{ flex: '0 0 85%', backgroundColor: '#FFF6D6', padding: '8px' }}>
              {isEditing ? (
                <TextArea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
              ) : (
                <p>{note.content}</p>
              )}

              {isEditing ? (
                <div style={{ marginTop: '8px' }}>
                  <Button size="sm" radius="sm" color="primary" className="mr-2" onClick={() => handleSave(note)}>
                    Save
                  </Button>
                  <Button size="sm" radius="sm" color="danger" onClick={handleCancel} style={{ marginLeft: '8px' }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <EditIcon 
                className="mt-4"
                style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'blue' }}
                onClick={() => handleEdit(note)}
                Edit
                />
               
              )}
            </CardBody>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

export default NoteDriver;


