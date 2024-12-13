import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ListItem, List, ListItemText } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Alert } from '@material-ui/lab';
import {
  localRoutes,
  remoteRoutes,
  appPermissions,
} from '../../data/constants';
import { get } from '../../utils/ajax';
import Layout from '../../components/layout/Layout';
import { IReport } from './types';
import Loading from '../../components/Loading';
import { IState } from '../../data/types';
import Toast from '../../utils/Toast';
import XBreadCrumbs from '../../components/XBreadCrumbs';
import { hasAnyRole } from '../../data/appRoles';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  reportList: {
    marginTop: theme.spacing(2),
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    marginLeft: theme.spacing(2),
  },
}));

const ReportList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<IReport[]>([]);
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      get(
        remoteRoutes.reports,
        (response: any) => {
          setReports(response);
        },
        (error: any) => {
          Toast.error('Failed to fetch reports');
          console.error('Failed to fetch reports', error);
        },
        () => setLoading(false),
      );
    };

    fetchReports();
  }, []);

  const handleSubmitReport = async (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submit`);
  };

  const handleViewSubmissions = async (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submissions`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout title="Report List">
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Reports"
            paths={[
              {
                path: localRoutes.home,
                label: 'Dashboard',
              },
            ]}
          />
        </Box>
        <Box mt={2} className={classes.reportList}>
          {reports.length === 0 && (
            <Alert severity="info">Sorry, No Reports Found!</Alert>
          )}
          <List>
            {reports.map((report) => (
              <ListItem key={report.id} alignItems="flex-start" disableGutters>
                <ListItemText primary={report.name} />
                <div className={classes.buttonContainer}>
                  {report.fields && report.fields.length && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSubmitReport(report)}
                    >
                      Submit Report
                    </Button>
                  )}
                  {hasAnyRole(user, [
                    appPermissions.roleReportViewSubmissions,
                  ]) && (
                    <IconButton
                      size="medium"
                      color="primary"
                      aria-label="edit"
                      component="span"
                      onClick={() => handleViewSubmissions(report)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Layout>
  );
};

export default ReportList;
