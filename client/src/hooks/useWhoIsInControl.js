import { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_SESSION, SESSION_CONTROL_SUBSCRIPTION } from '../graphQL';
import { PARTICIPANT_ROLES, SESSION_CONFIG } from '../constants';

export const useWhoIsInControl = (sessionId) => {
  const [whoIsInControl, setWhoIsInControl] = useState(PARTICIPANT_ROLES.CUSTOMER);

  const { loading, error, data } = useQuery(GET_SESSION, { 
    variables: {
      sessionId: SESSION_CONFIG.DEFAULT_SESSION_ID
    }
  });

  const { data: subscriptionData } = useSubscription(SESSION_CONTROL_SUBSCRIPTION, {
    variables: {
      sessionId: SESSION_CONFIG.DEFAULT_SESSION_ID
    }
  });

  useEffect(() => {
    if (data?.viewSession?.whoIsInControl) {
      setWhoIsInControl(data.viewSession.whoIsInControl);
    }
  
    if (subscriptionData?.sessionControlUpdated?.whoIsInControl) {
      setWhoIsInControl(subscriptionData.sessionControlUpdated.whoIsInControl);
    }
  }, [data, subscriptionData]);

  return { whoIsInControl, loading, error };
};