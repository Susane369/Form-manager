import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Box, 
  useTheme,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from '../context/FormContext';

interface RecentActivitiesProps {
  activities: Activity[];
  onViewForm?: (formId: string) => void;
}

const ActivityIcons = {
  form_created: <AddIcon color="success" />,
  form_updated: <EditIcon color="info" />,
  form_deleted: <DeleteIcon color="error" />,
  response_submitted: <CheckCircleIcon color="primary" />
};

const ActivityTitles = {
  form_created: 'creó el formulario',
  form_updated: 'actualizó el formulario',
  form_deleted: 'eliminó el formulario',
  response_submitted: 'envió una respuesta al formulario'
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, onViewForm }) => {
  const theme = useTheme();

  if (activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="textSecondary">No hay actividad reciente para mostrar</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem 
            alignItems="flex-start"
            sx={{
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                cursor: onViewForm ? 'pointer' : 'default'
              }
            }}
            onClick={() => onViewForm?.(activity.formId)}
          >
            <ListItemAvatar>
              <Tooltip title={ActivityTitles[activity.type]}>
                <Avatar sx={{ bgcolor: 'transparent', color: 'inherit' }}>
                  {ActivityIcons[activity.type]}
                </Avatar>
              </Tooltip>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle2" component="span">
                  <strong>{activity.userName}</strong> {ActivityTitles[activity.type]} "{activity.formTitle}"
                </Typography>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {formatDistanceToNow(new Date(activity.timestamp), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </Typography>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentActivities;
