import React from 'react';
import styled from 'styled-components';

const ProgressBarContainer = styled.div`
  position: relative;
  height: 20px;
  width: 100%px;
  border: 1px solid #959595;
`;

const ProgressBarFiller = styled.div`
  background: #9bc19c;
  height: 100%;
  width: ${props => props.width}%;
  border-radius: inherit;
  transition: width .2s ease-in;
`;

const ProgressBar = ({percentage, rightLabel}) => (
  <ProgressBarContainer>
    <ProgressBarFiller width={percentage}/>
  </ProgressBarContainer>
)

export default ProgressBar;
