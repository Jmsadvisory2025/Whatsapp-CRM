// hooks/useErrorRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearPatientsError } from '../store/patientsSlice';
import { clearProspectsError } from '../store/prospectsSlice';
import { clearLeadsError } from '../store/leadsSlice';
import { clearDashboardError } from '../store/dashboardSlice';

const useErrorRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get errors from all slices
  const patientsError = useSelector((state) => state.patients?.error);
  const prospectsError = useSelector((state) => state.prospects?.error);
  const leadsError = useSelector((state) => state.leads?.error);
  const dashboardError = useSelector((state) => state.dashboard?.error);

  useEffect(() => {
    // Check for any error that might contain status information
    const errors = [patientsError, prospectsError, leadsError, dashboardError];
    const errorWithStatus = errors.find(error => {
      if (typeof error === 'string') {
        // Check if error message contains status codes
        if (error.includes('401') || error.includes('Unauthorized')) return '401';
        if (error.includes('403') || error.includes('Forbidden')) return '403';
        if (error.includes('404') || error.includes('Not Found')) return '404';
        if (error.includes('400') || error.includes('Bad Request')) return '400';
      }
      return null;
    });

    if (errorWithStatus) {
      let status = '500'; // Default to server error
      
      if (patientsError?.includes('401') || patientsError?.includes('Unauthorized')) status = '401';
      else if (patientsError?.includes('403')) status = '403';
      else if (patientsError?.includes('404')) status = '404';
      else if (patientsError?.includes('400')) status = '400';
      
      navigate(`/error/${status}`);
      
      // Clear all errors after redirect
      dispatch(clearPatientsError());
      dispatch(clearProspectsError());
      dispatch(clearLeadsError());
      dispatch(clearDashboardError());
    }
  }, [patientsError, prospectsError, leadsError, dashboardError, navigate, dispatch]);

  return null;
};

export default useErrorRedirect;