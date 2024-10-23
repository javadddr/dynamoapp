import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import logo12 from "./logo123.png"
import logo126 from "./assets/logo5.png"
import {
  FileProtectOutlined, TruckOutlined, HeatMapOutlined, UsergroupAddOutlined, DollarOutlined,
  FundProjectionScreenOutlined, SafetyOutlined, FormatPainterOutlined, FundViewOutlined, IdcardOutlined,
  SettingOutlined, MoneyCollectTwoTone
} from '@ant-design/icons';
import "./Sidebar.css"
import { Menu } from 'antd';
const token = localStorage.getItem('userToken');
const userId = localStorage.getItem('userId');

const userRoles = localStorage.getItem('userRoles');

const capacity = Number(localStorage.getItem('capacity'));  // Convert to number
const createdAtDays = Number(localStorage.getItem('createdAtDays'));  // Convert to number

let statusi = null;

if (capacity === 0 && createdAtDays < 14) {
  statusi = `Trial ${13-createdAtDays} days left`;
}
console.log("statusi", statusi);
console.log("createdAtDays", createdAtDays);
console.log("capacity", capacity);
console.log("token", token);
const userInfo = {
  token: token,
  userId:userId,
};

const handleSubscribeClick = () => {
 
console.log("token",token)
console.log("userId",userId)
  if (!token || !userId) {
    console.error("User token or ID is missing!");
    return; // Exit if no token or userId is available
  }

  // Construct the URL with query parameters
  const billingUrl = new URL('https://billing.dynamofleet.com');
  billingUrl.searchParams.append('token', token);
 
  // Navigate to the billing page in the same tab with parameters
  window.location.href = billingUrl.href;
};

// Menu items
const items = [
  { key: 'sub1', label: <Link to="/fleet-overview"></Link>},
  { key: 'sub2', label: <Link to="/fleet-overview">Fleet Overview</Link>, icon: <FundViewOutlined style={{ fontSize: '20px' }} /> },
  { key: 'sub3', label: <Link to="/vehicles">Vehicles</Link>, icon: <TruckOutlined style={{ fontSize: '20px' }} /> },
  { key: 'sub4', label: <Link to="/drivers">Drivers</Link>, icon: <UsergroupAddOutlined style={{ fontSize: '20px' }} /> },
  {
    key: 'sub5',
    label: 'Compliance',
    icon: <SafetyOutlined style={{ fontSize: '20px' }} />,
    children: [
      { key: '9', label: <Link to="/vehicle-inspection">Vehicle Inspection</Link>, icon: <FileProtectOutlined /> },
      { key: '10', label: <Link to="/drivers-license">Drivers' License</Link>, icon: <IdcardOutlined /> },
    ],
  },
  {
    key: 'sub6',
    label: 'Operations',
    icon: <SettingOutlined style={{ fontSize: '20px' }} />,
    children: [
      { key: '1', label: <Link to="/driving-fines">Driving fines</Link>, icon: <DollarOutlined /> },
      { key: '2', label: <Link to="/equipments">Equipments</Link>, icon: <FormatPainterOutlined /> },
      { key: '3', label: <Link to="/areas">Areas</Link>, icon: <HeatMapOutlined /> },
    ],
  },
  { key: 'sub7', label: <Link to="/reports">Reports</Link>, icon: <FundProjectionScreenOutlined style={{ fontSize: '20px' }} /> },
  
  // Modified Purchase capacity item
  { key: 'sub8', label: 'Purchase capacity', icon: <MoneyCollectTwoTone style={{ fontSize: '20px' }} />, onClick: handleSubscribeClick },

];

const Sidebar = ({ theme, collapsed }) => {
  const [userInfo, setUserInfo] = useState({});

  return (
    <div className={`h-screen fixed top-0 left-0 flex flex-col ${collapsed ? 'w-14' : 'w-56'} justify-between`}>
      {/* Menu section */}
      <div className="flex flex-col flex-1">
        <Menu
          theme={theme}
          mode="inline"
          inlineCollapsed={collapsed}
          items={items}
          style={{
            width: collapsed ? 56 : 225,
            fontSize: 15,
            boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingTop: "15px"
          }}
        />
      </div>
      {statusi && !collapsed && (
  <div
    className="cardtrial transition-all duration-300"
    onClick={handleSubscribeClick}
    style={{
      position: 'fixed',
      bottom: '10px',
      left: '5px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      width: '210px',
    }}
  >
    <span>You are using the trial version,</span> 
    <h1>with {13 - createdAtDays} days remaining.</h1>
    <span>Click here to subscribe.</span>
  </div>
)}

  <div
  className={`cardtrial2 transition-all duration-300`}
  style={{
    position: 'fixed',
    top: '20px',
    left: '5px',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    width: collapsed ? '46px' : '210px',
    height: '50px',
  }}
>
  <a href="https://www.dynamofleet.com/" target="_blank" rel="noopener noreferrer">
    <img
      src={collapsed ? logo126 : logo12}
      alt="Logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  </a>
</div>



    </div>
  );
};

export default Sidebar;
