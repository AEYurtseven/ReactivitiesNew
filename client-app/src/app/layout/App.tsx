import 'semantic-ui-css/semantic.min.css'
import React, { Fragment, useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import { observer } from 'mobx-react-lite';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import HomePage from '../home/HomePage';
import { ToastContainer } from 'react-toastify';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponents';
import ModalContainer from '../common/modals/ModalContainer';


function App() {
  const location = useLocation();
  const {commonStore, userStore}= useStore();
  const {} = useStore();


  useEffect(() => {
    if(commonStore.token){
        userStore.getUser().finally(()=>commonStore.setAppLoaded());
    } else{
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore])

  if(!commonStore.appLoaded) return <LoadingComponent content='Loading app...'/>

  return (
    <Fragment>
      <ScrollRestoration/>
      <ModalContainer/>
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
