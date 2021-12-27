import React from 'react';
import { Button } from 'antd';
import DriveApi from '../../api/drive-api';

export default function Logout() {
  return (
    <Button onClick={ () => DriveApi.signOut() } danger>Sign Out</Button>
  )
}
