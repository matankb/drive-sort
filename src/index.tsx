import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App/App';
import { message } from 'antd';

// ANT DESIGN CONFIG
message.config({
  maxCount: 1
})

ReactDOM.render(
  <App />,
  document.getElementById('root')
);