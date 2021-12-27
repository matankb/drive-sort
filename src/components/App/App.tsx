import React from 'react';

import { FileSort } from '../FileSort/FileSort';
import LandingPage from '../LandingPage/LandingPage';
import DriveApi from '../../api/drive-api';

import './App.css';
import Header from '../Header/Header';

interface AppState {
  clientInit: boolean;
  signedIn: boolean;
  appLaunched: boolean;
  email?: string;
}

class App extends React.Component<{}, AppState> {

  state = {
    clientInit: false,
    signedIn: false,
    appLaunched: false,
    email: undefined,
  }

  async componentDidMount() {
    await DriveApi.init();
    const email = DriveApi.getUserEmail();
    this.setState({ signedIn: DriveApi.isSignedIn(), clientInit: true, email });

    DriveApi.addSigninListener(async (signedIn: boolean) => {
      const email = DriveApi.getUserEmail();
      this.setState({ signedIn, appLaunched: signedIn, email });
    })
  }

  handleLandingPageButtonClick = async () => {
    if (!this.state.signedIn) {
      await DriveApi.signIn();
    }
    this.setState({ appLaunched: true });
  }

  render() {
    return (
      <div className="App">
        <Header 
          signedIn={this.state.signedIn} 
          appLaunched={this.state.appLaunched} 
          email={this.state.signedIn ? this.state.email : undefined}
        />
        {
          !this.state.appLaunched
            ? <LandingPage
              buttonText={this.state.signedIn ? 'Launch App' : 'Sign In With Google Drive'}
              showSpinner={!this.state.clientInit}
              onButtonClick={this.handleLandingPageButtonClick}
              showWarning={this.state.clientInit && !this.state.signedIn}
            />
            : <FileSort />
        }
      </div>
    );
  }
}

export default App;