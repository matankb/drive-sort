import React from 'react';
import { PageHeader, Menu, Dropdown, Button } from 'antd';

import logo from '../../assets/logo.png';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons';
import Logout from '../Logout/Logout';

interface HeaderProps {
  button?: JSX.Element | false;
  signedIn: boolean;
  appLaunched: boolean;
  email?: string;
}

export default function Header({ signedIn, appLaunched, email }: HeaderProps) {

  const menu = (
    <Menu>
      <Menu.Item icon={<ReloadOutlined />} key="refresh">
          Refresh
      </Menu.Item>
    </Menu>
  );

  const dropdown = (
    <Dropdown key="more" overlay={menu}>
      <Button
        style={{
          border: 'none',
          padding: 0,
        }}
      >
        <EllipsisOutlined
          style={{
            fontSize: 20,
            verticalAlign: 'top',
          }}
        />
      </Button>
    </Dropdown>
  )

  return (
    <PageHeader
      title="Drive Organizer"
      style={{ border: '1px solid rgb(235, 237, 240)', marginBottom: 10 }}
      avatar={{ src: logo }}
      extra={[
        <span>{ email }</span>,
        signedIn && (
          <Logout />
        ),
        appLaunched && dropdown
      ]}
    />
  )
}