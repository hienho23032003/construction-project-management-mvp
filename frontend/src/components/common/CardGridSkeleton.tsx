import React from 'react';
import { Grid, Card, CardContent, Box, Skeleton } from '@mui/material';

interface CardGridSkeletonProps {
  count?: number;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', p: 1 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="text" width="85%" height={28} />
              <Skeleton variant="text" width="60%" height={20} />
              <Box sx={{ mt: 1 }}>
                <Skeleton variant="rounded" width="100%" height={8} sx={{ borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
