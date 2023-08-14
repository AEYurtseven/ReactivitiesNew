import 'semantic-ui-css/semantic.min.css'
import React, { Fragment } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import { observer } from 'mobx-react-lite';
import { Outlet, useLocation } from 'react-router-dom';
import HomePage from '../home/HomePage';
import { ToastContainer } from 'react-toastify';

function App() {
  const location = useLocation();

  return (
    <Fragment>
      <ToastContainer position ='bottom-right' hideProgressBar theme='colored' />
      {location.pathname === '/' ? <HomePage/> : (
      <Fragment>
        <NavBar />
        <Container style={{ marginTop: '7em' }}>
          <Outlet />
        </Container>
      </Fragment>
      )}
    </Fragment>
  );
}

export default observer(App);
