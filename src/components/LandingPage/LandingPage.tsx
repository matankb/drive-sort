import React from 'react';
import { Button, Typography, Alert } from 'antd';

import LoadingPage from '../LoadingPage/LoadingPage';

import style from './login.module.css';

interface LandingPageProps {
  showSpinner: boolean;
  buttonText: string;
  onButtonClick: () => void;
  showWarning: boolean;
}

export default function LandingPage(props: LandingPageProps) {

  return (
    <div className={style['landing-page']}>
      <Typography.Title>Drive Organizer for Google Drive&trade;</Typography.Title>
      
      {
        props.showSpinner
          ? <LoadingPage message="Connecting to Drive..." />
          : <Button
            type="primary"
            onClick={props.onButtonClick}
            size="large"
            className={style['login-button']}
          >
            {props.buttonText}
          </Button>
      }

      {
        props.showWarning &&
        <Alert
          type="warning"
          className={style.warning}
          showIcon
          message="The sign-in screen may show a warning"
          description={
            <span>
              Drive Organizer is experimental and has not been verified by Google. 
              The first time you sign in, click <u>Advanced</u>, then <u>Go to Drive Organizer (unsafe)</u>
            </span>
          }
        />
      }

    </div>
  )
}