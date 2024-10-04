import React, { useState, useEffect } from "react";
import { DownCircleOutlined } from '@ant-design/icons';
import { DeleteIcon } from "./DeleteIcon";
import {EditIcon} from "./EditIcon";
import { useCars, useDrivers } from '../CarDriver';
import { Button } from '@nextui-org/react';
import { Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs'; // Import dayjs for date manipulation
import { Card, CardBody, CardFooter, CardHeader, Checkbox, Chip } from '@nextui-org/react';
import {Tabs, Tab} from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import relativeTime from 'dayjs/plugin/relativeTime';
import {Accordion, AccordionItem, Avatar} from "@nextui-org/react";
import { Alert } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
dayjs.extend(relativeTime);
function TaskDriver({theme, driver: propDriver, onDriverUpdate}) {

  const [driver, setDriver] = useState(propDriver);
  const isDarkMode = theme === 'dark';
  const { drivers, refreshDrivers } = useDrivers();
  const [errorMessage, setErrorMessage] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAlert, setShowAlert] = useState(false); 
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null); // Track which task is being edited
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskOwner, setEditTaskOwner] = useState('');
const [editTaskDueDate, setEditTaskDueDate] = useState(new Date());
  const [newTaskDueDate, setNewTaskDueDate] = useState(dayjs()); // Use dayjs for initial date
  const toggleAccordion = () => {
    setIsAccordionOpen(prev => !prev);
  };
  const token = localStorage.getItem('userToken');
  const [users, setUsers] = useState([]);
  console.log(users)
  useEffect(() => {
    if (errorMessage) {
      setShowAlert(true); // Show the alert
      const timer = setTimeout(() => {
        setShowAlert(false); // Hide the alert after 10 seconds
        setErrorMessage(''); // Clear the error message
      }, 4000);
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }
  }, [errorMessage]);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

  const handleAddTask = async () => {
    if (!newTaskDescription|| !newTaskDueDate|| !newTaskOwner) {
      setErrorMessage("Please fill in all fields before submitting.");
      return; // Stop submission if any field is missing
    }
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: newTaskDescription,
          dueDate: newTaskDueDate,
          owner: newTaskOwner,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const updatedNote = await response.json(); // Assuming the API returns the updated note
      const updatedDriver= updatedNote.driver
      if (updatedDriver) {
        setDriver(updatedDriver);
        onDriverUpdate(updatedDriver);
      }
      setIsAccordionOpen(false)
      setNewTaskDescription('');
      setNewTaskDueDate(dayjs()); // Reset date after task creation
      setNewTaskOwner('');
    } catch (error) {
      console.error(error);
    }
  };
  const filteredTasks = driver.tasks
  .filter(task => task.taskStatus !== "Deleted")
  .filter(task => activeTab === 'open' ? task.taskStatus === 'Open' : task.taskStatus === 'Done') // Filter based on tab
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    console.log('Toggling status for task with ID:', taskId, 'Current status:', currentStatus);
    const newStatus = currentStatus === 'Open' ? 'Done' : currentStatus === 'Done' ? 'Open' : 'Deleted';
    const token = localStorage.getItem('userToken'); 
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to toggle task status');
      }
  
      const updatedNote = await response.json(); // Assuming the API returns the updated note
      const updatedDriver= updatedNote.driver
      if (updatedDriver) {
      
        setDriver(updatedDriver);
        onDriverUpdate(updatedDriver);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const promptDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setOpenDialog(true);  // Open modal
    console.log(taskId)

  };
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    await handleToggleTaskStatus(taskToDelete, 'Deleted');
    setTaskToDelete(null); 
    setOpenDialog(false); 
  };



  const handleUpdateTask = async (taskId) => {
    const token = localStorage.getItem('userToken'); 
   
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/drivers/${driver._id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editTaskDescription,
          dueDate: editTaskDueDate,
          owner: editTaskOwner,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const updatedNote = await response.json(); // Assuming the API returns the updated note
      const updatedDriver= updatedNote.driver
      if (updatedDriver) {
       
        setDriver(updatedDriver); // Update local state with the refreshed car
        onDriverUpdate(updatedDriver); // Propagate changes up to the parent component if needed
      }
   
      setEditingTaskId(null); // Exit editing mode
    } catch (error) {
      console.error(error);
   
    }
  };















  return (
    <div className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
           {showAlert && (
  <div className={`fixed top-4 right-4 z-50 w-72 transition-transform transform translate-x-0 animate-slide-in ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
        {isAccordionOpen ? 'Create New Task' : 'Create New Task'}
      </Button>

      <div className={`w-full mt-1 mb-2 overflow-hidden transition-all duration-700 ease-in-out ${isAccordionOpen ? 'animate-slide-in-right max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="relative p-4 border border-gray-300 rounded-md space-y-4">
          <div className="flex flex-row space-x-1">
            <div className='w-5/6'>
              <div className="flex flex-row">
                <div className='w-5/6'>
                  <TextArea
                    className="shadow-md"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Task description"
                    autoSize={{
                      minRows: 3,
                      maxRows: 5,
                    }}
                  />
                </div> 
                <div className="flex flex-col">
                  <DatePicker 
                    value={newTaskDueDate}
                    onChange={(date) => setNewTaskDueDate(date ? dayjs(date) : null)} // Ensure date is converted to dayjs
                    placeholder="Due Date" 
                    className="shadow-md ml-2 mb-3 w-[190px]"
                  />

                  <Select
                    value={newTaskOwner}
                    onChange={(value) => setNewTaskOwner(value)}
                    className="shadow-md ml-2 w-[190px]"
                    placeholder="Select Owner"
                    
                  >
                    <Option value="" disabled>Select Owner</Option>
                    {users.map((user, index) => (
                      <Option key={index} value={user._id}>{user.username}</Option>
                    ))}
                  </Select>
                </div> 
              </div>
            </div>
            <div className="w-1/6">
              <Button onClick={handleAddTask} size="sm" radius="sm" className="ml-9 bg-cyan-500 text-white">
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div >
      <Tabs
        aria-label="Task Status Tabs"
        radius="full"
        onSelectionChange={(key) => setActiveTab(key)} // Handle tab change
        defaultValue="open"
        color="warning"
        className={`flex justify-center m-4 mb-2 mt-0 text-sm ${isDarkMode?"dark":"light"}`}
      >
        <Tab key="open" title="Open Tasks" />
        <Tab key="done" title="Closed Tasks" />
      </Tabs>
      </div>
      {filteredTasks.map((task, index) => (
  <Card key={task._id} className={`m-4 mb-2 mt-0 text-sm ${isDarkMode?"dark":"light"}`}>
    <CardHeader>
      <div className="flex justify-between w-full">
        <div className="flex items-center">
          <Chip color={task.taskStatus === "Open" ? "warning" : "success"} variant="flat" className="mr-2">
            {task.taskStatus}
          </Chip>
          <span className="text-xs text-gray-500">
            {users.find(user => user._id === task.owner)?.username || 'No owner'}
          </span>
        </div>
        <span className="text-xs text-gray-500">Due: {dayjs(task.dueDate).format('YYYY-MM-DD')}</span>
        <span className="text-xs text-gray-500">Created: {dayjs(task.creatingDate).fromNow()}</span>
      </div>
    </CardHeader>

    <CardBody>
    {editingTaskId === task._id ? (
      <div >
         <div className="flex flex-row">
          <TextArea
            className="shadow-md mr-2 mb-2"
            value={editTaskDescription}
            onChange={(e) => setEditTaskDescription(e.target.value)}
            placeholder="Task description"
            autoSize={{
              minRows: 3,
              maxRows: 5,
            }}
          />
          <div>
              <input
                className="mb-2 w-[120px] h-[35px] border border-gray-300 rounded-[5px] text-[13px]"
                  type="date"
                  value={editTaskDueDate.toISOString().split('T')[0]}
                  onChange={(e) => setEditTaskDueDate(new Date(e.target.value))}
                />
       
            <Select
            value={editTaskOwner}
            onChange={(e) => setEditTaskOwner(e.target.value)}
            placeholder="Edit Owner"
          >
            {users.map((user) => (
              <Option key={user._id} value={user._id}>
                {user.username}
              </Option>
            ))}
          </Select>
          </div>
          </div>
          <div className="flex flex-end w-full">
          <Button size="sm" radius="sm" color="primary" className="mr-2"  onClick={() => handleUpdateTask(task._id)}>Save</Button>
          <Button size="sm" radius="sm" color="danger" className="" onClick={() => setEditingTaskId(null)}>Cancel</Button>
          </div>
      </div>
    
    ) : (
        // Render plain text when not in edit mode
        <p className={task.taskStatus === "Open" ? (isDarkMode ? "text-white-900" : "text-gray-900") : "text-gray-500"}>
          {task.description || 'No description provided'}
        </p>
      )}
    </CardBody>

    <CardFooter>
      <div className="flex justify-between w-full items-center">
        <div className="flex space-x-2 items-center">
        <EditIcon 
         style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'blue' }}
        onClick={() => {
            setEditingTaskId(task._id);
            setEditTaskDescription(task.description);
            setEditTaskDueDate(new Date(task.dueDate));
            setEditTaskOwner(task.owner);
          }}
        />
          <DeleteIcon
            style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'red' }}
            onClick={() => promptDeleteTask(task._id)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            color="success"
            isSelected={task.taskStatus === 'Done'}
            onChange={() => handleToggleTaskStatus(task._id, task.taskStatus)}
          >
            <span className="text-sm">Done</span>
          </Checkbox>
        </div>
      </div>
    </CardFooter>
  </Card>
))}

<Modal isOpen={openDialog} onClose={() => setOpenDialog(false)}>
  <ModalContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this task?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={confirmDeleteTask}>
            Delete
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>

    </div>
  );
}

export default TaskDriver;

