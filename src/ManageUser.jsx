import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {  Button } from '@nextui-org/react';
import "./ManageUser.css"
import { Select } from 'antd';
import {EditIcon} from "./carscomponents/EditIcon";
import IconButton from '@mui/material/IconButton';
import { Input } from 'antd';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@nextui-org/react";
import { Tooltip } from "antd";
import plusi from "./plusi.svg"
function ManageUser({theme}) {
  const { Option } = Select;
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [areas, setAreas] = useState([]); // State to store fetched areas
  const allAreasOption = { label: "All", value: "all" };
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    roles: '', active: '', allowedArea: []
  });
const combinedOptions = [allAreasOption, ...areas];
const areasOptions = [{ label: 'All', value: 'all' }, ...areas.map((area) => ({ label: area.label, value: area.id }))];

let isDarkMode; 

if (theme === 'dark') {
  isDarkMode = true; // Set to true if theme is 'dark'
} else {
  isDarkMode = false; // Set to false otherwise
}
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: 'admin',
    allowedArea: []
  });

  const fetchUsers = async () => {
    const userToken = localStorage.getItem('userToken');
    const currentUsername = localStorage.getItem('username'); // Get the current user's username
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const filteredUsers = response.data.filter(user => user.username !== currentUsername); // Filter out the current user
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();

  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/areas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setAreas(response.data.map(area => ({ label: area.areaName, id: area._id })));
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, []);

 
  const handleInputChange = (e) => {
    const { name, value, options, type } = e.target;
    if (type === 'select-multiple' && name === "allowedArea") {
      const values = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData(prevState => ({
        ...prevState,
        [name]: values
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  const handleAreaChange = (value) => {
   
    setEditFormData(prev => ({ ...prev, allowedArea: value }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userToken = localStorage.getItem('userToken');
    const roles1 = editFormData.roles;
    const allowedArea1 = editFormData.allowedArea;
    const active1 = editFormData.active;
    const username1 = formData.username;
    const email1 = formData.email;
    const password1 = formData.password;
    
    console.log("roles1", roles1);
    console.log("allowedArea1", allowedArea1);
    console.log("active1", active1);
    console.log("username1", username1);
    console.log("email1", email1);
  
    // Prepare the data for submission
    const requestData = {
      username: username1,
      email: email1,
      password: password1,
      roles: roles1,
      allowedArea: allowedArea1
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestData), // Send the data as a JSON string
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: 'admin',
        allowedArea: []
      });
  
      // Optionally call fetchUsers() if needed
      fetchUsers();
  
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditFormData({
      roles: user.roles,
      active: user.active ? "Active" : "Pending",
      allowedArea: user.allowedArea
    });
  };
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    if (name === "active") {
        // Convert "Active" to true, anything else to false
        setEditFormData(prev => ({ ...prev, [name]: value === "Active" }));
    } else {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    }
};

  
  
  const saveEdits = async () => {
    const userToken = localStorage.getItem('userToken');
    const updateData = {
        roles: editFormData.roles,
        active: editFormData.active === "Active",  // Convert to boolean
        allowedArea: editFormData.allowedArea
    };


    try {
        const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/auth/updateUser/${editingUserId}`, updateData, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        if (response.status === 200) {
            setEditingUserId(null);
            fetchUsers(); // Reload the user list after the update
        } else {
            console.error('Failed to update user:', response.data.message);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
};
console.log("areas",areas)
  return (
    <div className={`pl-3 pr-3  h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
    
      <div className={`flex justify-items-end justify-end  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
   

  <Button className="mt-3 mb-3 mr-4 w-[180px] shadow-xl "  color="primary" variant="shadow" radius="sm" size="md" onClick={() => setShowModal(true)}>
  <img src={plusi} alt="Add" style={{width:'14%' }} />
  Create New User
</Button>
</div>

      {showModal && (
        <>
          <div className={`overlayoknfd `} onClick={() => setShowModal(false)}></div>
          <div className={`modalusercreatin ${isDarkMode ? 'bg-gray-200 text-black' : 'bg-white text-gray-900 text-md'}`}>
            <div className={` ${isDarkMode ? 'bg-gray-200 text-black' : 'bg-white text-blue-600 text-md'}`}>Add New User</div>
            <form onSubmit={handleSubmit}>
             <div className='ejazebedin'>
                <div className='userfotbaba'>
                  <div className={`text-sm text-black `}>Username: </div>
                  <div className=''>
                  <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter username"
                      autoComplete="username" 
                      style={{
                        border: '1px solid #c3c3c3', // Gray border
                        height: '30px',           // Height
                        width: '240px',           // Width
                        borderRadius: '5px', 
                        fontSize:'14px'     // Border radius
                      }}
                    />


                  </div>
                </div>
                <div className='userfotbaba'>
                <div className='userfotbaba1'>Email: </div>
                <div className=''>
                <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email"
                    autoComplete="email" 
                    style={{
                      border: '1px solid #c3c3c3', // Gray border
                      height: '30px',              // Height
                      width: '240px',              // Width
                      borderRadius: '5px',         // Border radius
                      fontSize: '14px'             // Font size
                    }}
                  />

                  </div>
                </div>
                <div className='userfotbaba'>
                <div className='userfotbaba1'>Password: </div>
                <div className=''>
                <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      border: '1px solid #c3c3c3', // Gray border
                      height: '30px',              // Height
                      width: '240px',              // Width
                      borderRadius: '5px',         // Border radius
                      fontSize: '14px'             // Font size
                    }}
                  />

                  </div>
                </div>
               
                <div className='userfotbaba'>
                  <div className='userfotbaba1'>Roles: </div>
                  <div className=''>
                  <Select
                      name="roles"
                      value={formData.roles}
                      onChange={(value) => handleInputChange({ target: { name: 'roles', value } })}
                      style={{
                        width: '240px',              // Width
                        border: '1px solid #c3c3c3', // Gray border
                        borderRadius: '5px',         // Border radius
                      }}
                    >
                      <Option value="admin">Admin</Option>
                      <Option value="user">User</Option>
                    </Select>
                  </div>
                </div>

                <div className='userfotbaba'>
                  <div className='userfotbaba1'>Allowed Area:</div>
                  <div className=''>
                  <Select
                    mode="multiple"
                    placeholder="Select allowed areas"
                    value={editFormData.allowedArea}
                    onChange={handleAreaChange}
                    style={{
                      width: '240px',              // Width
                      border: '1px solid #c3c3c3', // Gray border
                      borderRadius: '5px',         // Border radius
                    }}
                  >
                    <Option value="all">All</Option>
                    {areas.map(area => (
                      <Option key={area.id} value={area.label}>
                        {area.label}
                      </Option>
                    ))}
                  </Select>


                  </div>
                </div>

              </div>

              <div className='btnbothccxs' style={{backgroundColor:isDarkMode? "#E5E7EB":"white"}}>
              <Button color="danger" variant="flat" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button color="success" variant="flat"  type="submit">Submit</Button>
             
              </div>
            </form>
          </div>
        </>
      )}
     <Table aria-label="Manage Users" css={{ height: "auto", minWidth: "100%" }} className={`${isDarkMode?'dark':''}`} >
      <TableHeader>
        <TableColumn>Username</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Roles</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn className="max-w-[100px]">Allowed Area</TableColumn> {/* Set width to 300px */}
        <TableColumn>Action</TableColumn>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {editingUserId === user._id ? (
                <Select
                  value={editFormData.roles}
                  onChange={handleEditFormChange}
                  placeholder="Select role"
                  options={[
                    { label: "Admin", value: "admin" },
                    { label: "User", value: "user" }
                  ]}
                />
              ) : (
                user.roles
              )}
            </TableCell>
            <TableCell>
              {editingUserId === user._id ? (
                <Select
                  value={editFormData.active ? "Active" : "Pending"}
                  onChange={handleEditFormChange}
                  placeholder="Select status"
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Pending" }
                  ]}
                />
              ) : (
                user.active ? 'Active' : 'Inactive'
              )}
            </TableCell>
            <TableCell className="w-[300px] truncate">
              {editingUserId === user._id ? (
                <Select
                  mode="multiple"
                  value={editFormData.allowedArea}
                  onChange={handleAreaChange}
                >
                  {areasOptions.map(option => (
                    <Option key={option.id} value={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Tooltip title={user.allowedArea.join(', ')}>
                  <span className="truncate">{user.allowedArea.join(', ')}</span> {/* Truncate with ellipsis */}
                </Tooltip>
              )}
            </TableCell>
            <TableCell>
              {editingUserId === user._id ? (
                <Button size="sm" color="primary"  onClick={saveEdits}>
                  Save
                </Button>
              ) : (
                <EditIcon
                  style={{ cursor: 'pointer', width: '17px', height: '17px', color: 'blue' }}
                  onClick={() => startEdit(user)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    
  );
}

export default ManageUser;


