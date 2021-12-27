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
}

class App extends React.Component<{}, AppState> {

  state = {
    clientInit: false,
    signedIn: false,
    appLaunched: false,
  }

  async componentDidMount() {
    await DriveApi.init();
    this.setState({ signedIn: DriveApi.isSignedIn(), clientInit: true });

    DriveApi.addSigninListener((signedIn: boolean) => {
      this.setState({ signedIn, appLaunched: signedIn });
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
        <Header signedIn={this.state.signedIn} appLaunched={this.state.appLaunched} />
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