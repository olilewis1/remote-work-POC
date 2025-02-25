import { useEffect, useState, useRef } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { jwtDecode } from "jwt-decode";
import { UPDATE_FORM, GET_DETAILS, GET_SESSION, FORM_UPDATED_SUBSCRIPTION, PAGE_SCROLL_SUBSCRIPTION, PAGE_SCROLL_MUTATION, UPDATE_SESSION_CONTROL, SESSION_CONTROL_SUBSCRIPTION} from './graphQL';
const PARTICIPANT_ROLES = {
  CUSTOMER: 'CUSTOMER',
  PARTNER: 'PARTNER'
};


function App() {
  const partnerRef = useRef(null);
  const customerRef = useRef(null);
  let token = localStorage.getItem('token');
  const [whoIsInControl, setWhoIsInControl] = useState(PARTICIPANT_ROLES.CUSTOMER);
  const [formData, setFormData] = useState({
    postCode: '',
    ownProperty: false,
    myAddressNotListed: false
  });
  const { loading, error, data } = useQuery(GET_SESSION, { 
    variables: {
      sessionId: '1'
    }
  });
  const [updateSessionControl,  {loading: updateControlLoading, error: updateControlError, data: updateControlData}] = useMutation(UPDATE_SESSION_CONTROL, {
    variables: {
      sessionId: '1'
    }
  });
  const { data: subscriptionData } = useSubscription(SESSION_CONTROL_SUBSCRIPTION, {
    variables: {
      sessionId: '1'
    }
  })
    console.log(data, 'data whoIsInControl');
    useEffect(() => {
      // Check if data exists and has the required property
      if (data?.viewSession?.whoIsInControl) {
        setWhoIsInControl(data.viewSession.whoIsInControl);
      }
    
      // Check if subscriptionData exists and has the required property
      if (subscriptionData?.sessionControlUpdated?.whoIsInControl) {
        setWhoIsInControl(subscriptionData.sessionControlUpdated.whoIsInControl);
      }
    }, [data, subscriptionData]);


  const [updateForm, { loading: mutationLoading }] = useMutation(UPDATE_FORM);
  const [updatePageScroll, { loading: pageScrollMutationLoading }] = useMutation(PAGE_SCROLL_MUTATION);
  const { data: subData, loading: subLoading, error: subError } = useSubscription(FORM_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
        console.log('Subscription received data:', data);
    },
    onError: (error) => {
        console.error('Subscription error:', error);
    }
});

const { data: pageScrollData, loading: pageScrollLoading, error: pageScrollError } = useSubscription(
  PAGE_SCROLL_SUBSCRIPTION,
  {
    variables: {
      sessionId: '1'
    },
    onData: ({ data }) => {
      console.log('Page scroll subscription data:', data);
    },
    onError: (error) => {
      console.error('Page scroll subscription error:', error);
    }
  }
);
useEffect(() => {
  console.log('Subscription state:', { subData, subLoading, subError }, subData?.data?.pages?.addressForm?.yourAddress);
  setFormData({
    postCode: subData?.formUpdated?.pages?.addressForm?.postCode,
    ownProperty: subData?.formUpdated?.pages?.addressForm?.ownProperty,
    myAddressNotListed: subData?.formUpdated?.pages?.addressForm?.myAddressNotListed,
    yourAddress: subData?.formUpdated?.pages?.addressForm?.yourAddress
  })
}, [subData, subLoading, subError]);

useEffect(() => {
  console.log('set form data', formData)
}, [formData]);

useEffect(() => {
  if (pageScrollData?.pageScrollUpdated?.scrollPosition && partnerRef.current) {
    partnerRef.current.scrollTo({
      top: pageScrollData.pageScrollUpdated.scrollPosition,
      behavior: 'smooth'
    });
  }
}, [pageScrollData]);

  // Add subscription hook
  if(!token) { 
    localStorage.setItem('token', 'token');
  }
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Use the most recent data (either from query or subscription)
  console.log(data);
  const handleInput = async (e) => {
    console.log(e.target.name, e.target.value, e.target.dataset.sensitive, 'dataset');
    const isSensitive = e.target.dataset.sensitive === 'true';
    const currentToken = localStorage.getItem('token');
    try {
      await updateForm({
        context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } ,
        variables: {
          sessionId: '1',
          key: e.target.name,
          value: isSensitive ? '*'.repeat(e.target.value.length) : e.target.value,
          form: 'addressForm' 
        }
      });
    } catch (error) {
      console.error('Error updating form:', error);
    }
  }

  const decoded = jwtDecode(token);
  console.log(decoded, 'decoded');
  
  const handleScroll = async (e) => {
    const position = e.target.scrollTop;
    console.log(position, 'position');
    try {
      await updatePageScroll({
        variables: {
          sessionId: '1',
          page: 1,
          scrollPosition: position
        }
      });
    } catch (error) {
      console.error('Error updating page scroll:', error);
    }
   } 

  if(decoded.role === whoIsInControl)  {
   return (
    <div ref={customerRef} style={{ height: '100vh', overflow: 'auto' }} onScroll={handleScroll}>
      <h1>In Control of Address Page</h1>
      <form> 
      <label htmlFor='postCode'>Post Code</label>
        <input type="text" name="postCode" onChange={handleInput} helperText="Enter your post code" />
        <label htmlFor='yourAddress'>Password</label>
        <input type="password" name="yourAddress" onChange={handleInput} helperText="Enter your password"  data-sensitive="true" />
      </form>
      <div style={{ height: '200px' }}> want</div>
      <div style={{ height: '200px' }}> to</div>
      <div style={{ height: '200px' }}> see</div>
      <div style={{ height: '200px' }}> further</div>
      <div style={{ height: '200px' }}> down</div>
      <div style={{ height: '200px' }}> the</div>
      <div style={{ height: '200px' }}> page</div>
      <div style={{ height: '200px' }}> ?</div>
    </div>
  );
}
if(decoded.role !== whoIsInControl) {

  return (
    <div ref={partnerRef} style={{ height: '100vh', overflow: 'auto' }}>
      <h1>Not In Control of Address Page</h1>
      <p>Do you need control?</p>
      <button onClick={async () => {
        try {
          await updateSessionControl({
            variables: {
              sessionId: '1'
            }
          });
        } catch (error) {
          console.error('Error updating session control:', error);
        }
      }}>Request Control</button>
      <form> 
        <label htmlFor='postCode'>Post Code</label>
        <input type="text" name="postCode" title='postCode' value={formData.postCode} readOnly/>
        <label htmlFor='yourAddress'>Password</label>
        <input type="password" name="yourAddress" title='yourAddress' value={formData.yourAddress} readOnly helperText="Enter your password"  data-sensitive="true" />
      </form>
      <div style={{ height: '200px' }}> want</div>
      <div style={{ height: '200px' }}> to</div>
      <div style={{ height: '200px' }}> see</div>
      <div style={{ height: '200px' }}> further</div>
      <div style={{ height: '200px' }}> down</div>
      <div style={{ height: '200px' }}> the</div>
      <div style={{ height: '200px' }}> page</div>
      <div style={{ height: '200px' }}> ?</div>
    </div>
  );
}
}

export default App;
