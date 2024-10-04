import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button ,Switch} from '@nextui-org/react';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import {MoonIcon} from "./MoonIcon";
import {SunIcon} from "./SunIcon";
import Useri from './Useri';
export default function Nav({ theme, collapsed, changeTheme, toggleSidebar }) {
  const classNameFORdark = `m-0 min-w-0 p-0 pt-0 h-7.6 `;

  return (

    <Navbar  maxWidth="full" className={` h-11 pl-0 px-0 m-0 ml-0 ${theme === 'dark' ? 'bg-customDark' : 'bg-white'}`} isBordered >
      <NavbarBrand>
        <NavbarItem >
          <Button
            type="secondary"
            onClick={toggleSidebar}
            className={`ml-1 ${classNameFORdark}`} // Margin-left to adjust spacing
          >
            {collapsed ? (
              <DoubleRightOutlined
                style={{
                  fontSize: '20px',
                  color: theme === 'dark' ? 'white' : 'rgb(137, 106, 242)',
                  backgroundColor: theme === 'dark' ? '#0F172B' : '#FFFFFF',
                }}
              />
            ) : (
              <DoubleLeftOutlined
                style={{
                  fontSize: '20px',
                  color: theme === 'dark' ? 'white' : 'rgb(137, 106, 242)',
                  backgroundColor: theme === 'dark' ? '#0F172B' : '#FFFFFF',
                }}
              />
            )}
          </Button>
        </NavbarItem>
      </NavbarBrand>
      <NavbarContent className="sm:flex gap-4" justify="between">
        <NavbarItem>
        
           <Switch
             onChange={(e) => changeTheme(e.target.checked)}
             size="sm"
         
            color="#0F172B"
            thumbIcon={({ isSelected, className }) =>
              isSelected ? (
                <SunIcon className={className} />
              ) : (
                <MoonIcon className={className} />
              )
            }
          >
        
    </Switch>
        </NavbarItem>
        <Useri theme={theme}/>
      </NavbarContent>
    </Navbar>
    
  );
}
