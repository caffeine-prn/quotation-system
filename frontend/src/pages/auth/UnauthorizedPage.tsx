import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" gutterBottom color="error">
          401
        </Typography>
        <Typography variant="h5" gutterBottom>
          접근 권한이 없습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          요청하신 페이지에 접근할 수 있는 권한이 없습니다.
          필요한 권한이 있다고 생각되시면 관리자에게 문의해주세요.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          메인으로 돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;