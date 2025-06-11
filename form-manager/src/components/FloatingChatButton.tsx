import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Tooltip, Zoom, keyframes } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const StyledFab = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: theme.shadows[6],
  transition: 'all 0.3s ease-in-out',
  zIndex: theme.zIndex.speedDial,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  animation: `${pulse} 2s infinite`,
}));

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    // Future implementation will handle chat opening
  };

  return (
    <>
      <Tooltip 
        title={isOpen ? 'Cerrar chat' : 'Asistente de IA'}
        placement="left"
        TransitionComponent={Zoom}
        arrow
      >
        <StyledFab
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            '&:hover': {
              animation: 'none', // Remove pulse animation on hover
            },
          }}
        >
          {isOpen ? (
            <CloseIcon fontSize="medium" />
          ) : (
            <ChatBubbleOutlineIcon fontSize="medium" />
          )}
        </StyledFab>
      </Tooltip>
      
      {/* Future chat interface will go here */}
      {/* {isOpen && (
        <ChatInterface onClose={() => setIsOpen(false)} />
      )} */}
    </>
  );
};

export default FloatingChatButton;
