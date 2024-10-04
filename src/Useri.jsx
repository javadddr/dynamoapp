import React from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Avatar } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function Useri({theme}) {
  const navigate = useNavigate();

  const emaili = localStorage.getItem('userEmail');
  const Usernamei = localStorage.getItem('username');
  const Roli = localStorage.getItem('userRoles');
console.log(Roli)
console.log(theme)
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('capacity');
    navigate('/login');
  };
  const handleManageUsersClick = () => {
    navigate('/manage-user');
  };
  const handleMyPlanClick = () => {
    navigate('/my-plan');
  };
  const handleHelpMeClick = () => {
    navigate('/help-me');
  };
  return (
    <div className={`flex items-center gap-1 ${theme === 'dark' ?"dark":""}`}>
      <Dropdown className={`${theme === 'dark' ?"bg-gray-800 text-white":""}`} color={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            size="sm"
            isBordered
            as="button"
            className="w-5 h-5 text-tiny"
            name={Usernamei}
            classNames={theme === 'dark' ? 'success' : 'default'}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownSection aria-label="Profile & Actions" showDivider>
            <DropdownItem textValue="Profile" key="profile" className="h-14 gap-0">
              <p className="font-semibold text-blue-500">Signed in as</p>
              <p className="font-semibold">{emaili}</p>
            </DropdownItem>
        
            <DropdownItem textValue="settings" key="settings">
              <p className="font-semibold text-blue-500">Username:</p>
              {Usernamei}
            </DropdownItem>
          
            <DropdownItem textValue="team_settings" key="team_settings">
              <p className="font-semibold text-blue-500">Role:</p>
              {Roli}
            </DropdownItem>
          </DropdownSection>
          <DropdownSection aria-label="Profile & Actions" showDivider>
           <DropdownItem textValue="manage_users" key="manage_users" onClick={handleManageUsersClick}>
              Manage Users
            </DropdownItem>
            <DropdownItem textValue="my_plan" key="my_plan" onClick={handleMyPlanClick}>My Plan</DropdownItem> {/* Changed key here */}
            <DropdownItem textValue="help_and_feedback" key="help_and_feedback" onClick={handleHelpMeClick}>Help & Feedback</DropdownItem>
          </DropdownSection>
          <DropdownItem className="text-red-500" textValue="logout" key="logout" color="danger" onClick={handleLogout}>
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
