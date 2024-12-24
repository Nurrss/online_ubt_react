import React from 'react';
import styled from 'styled-components';
import styles from './Loader.module.css';

const LoaderOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Loader = () => (
  <LoaderOverlay>
    <div className={styles.lds_facebook}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </LoaderOverlay>
);

export default Loader;
