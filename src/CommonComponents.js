import React from 'react';
import styled from 'styled-components';
import Loader from 'calcite-react/Loader';
import Panel from 'calcite-react/Panel';
import Button from 'calcite-react/Button';

const Container = styled.div`
  margin-top: 7rem;
  max-width: 40rem;
`;

const AboutText = () => (
  <div>
  <h1 style={{textAlign: "center"}}>Hello (Prospective) Partner!</h1>
  <p>This is a quick demo to showcase Partner User Types. Feature extraction and data labelling are hot topics, so imagine you're building a product to create data labels (manually for now). There are two personas:</p>
  <ul>
    <li>Labelers: people drawing features to train models</li>
    <li>Managers: people monitoring the status of labelling projects</li>
  </ul>
  <p>Log in to explore the experiences for these two personas! </p>
  </div>
)

const LoginWindow = ({onClick}) => (
  <Container>
    <Panel>
      <AboutText/>
      <div style={{textAlign: "center", marginTop: "2rem"}}>
        <Button half clear large onClick={onClick}>
          Log In
        </Button>
      </div>
    </Panel>
  </Container>
)

const LoaderWindow = () => (
  <Container>
    <Loader/>
  </Container>
)



export {LoginWindow, LoaderWindow };