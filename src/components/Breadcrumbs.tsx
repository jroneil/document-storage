import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const BreadcrumbsComponent = () => {
  const pathSegments = usePathname().split('/').filter(Boolean);

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs aria-label="breadcrumb">
        {pathSegments.slice(1).map((segment, index) => { // Skip the first segment
          const isLast = index === pathSegments.length - 2; // Adjust index for last check
          const path = '/' + pathSegments.slice(0, index + 2).join('/'); // Adjust path calculation
          return isLast ? (
            <Typography key={path} color="text.primary">
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Typography>
          ) : (
            <Link key={path} color="inherit" href={path}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsComponent;