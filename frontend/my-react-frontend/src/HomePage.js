import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import image1 from './trans.png'; // Importing image 1
import image2 from './map.png'; // Importing image 2
import image3 from './chat.png'; // Importing image 3
import customCursor from './cursor.png';


const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  height: 100vh;
  overflow: hidden;
`;

const StyledImage = styled.img`
width: 33.3333%; // Equal width for each image, adjust as necessary
  height: 100%; // Take up full container height
  transition: transform 0.3s ease-in-out, z-index 0s;
  object-fit: cover;
  &:hover {
    transform: scale(1.3);
    z-index: 2;
    cursor: url(${customCursor}), pointer;
  }
`;

const HomePage = () => {
  let navigate = useNavigate();

  return (
    <ImageContainer>
      <StyledImage src={image1} onClick={() => navigate('/page1')} alt="Image 1"/>
      <StyledImage src={image3} onClick={() => navigate('/chat')} alt="Image 2"/>
      <StyledImage src={image2} onClick={() => navigate('/map')} alt="Image 3"/>
    </ImageContainer>
  );
};

export default HomePage;
