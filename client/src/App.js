import { useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { useWhoIsInControl } from './hooks/useWhoIsInControl';
import { useFormData } from './hooks/useFormData';
import { useForm } from './hooks/useForm';
import { UPDATE_SESSION_CONTROL, PAGE_SCROLL_SUBSCRIPTION } from './graphQL';
import { SESSION_CONFIG } from './constants';

function App() {
  const { whoIsInControl, loading, error } = useWhoIsInControl(SESSION_CONFIG.DEFAULT_SESSION_ID);
  const { formData, updateForm } = useFormData();
  const { customerRef, partnerRef, handleInput, handleScroll, decoded } = useForm(updateForm, whoIsInControl);

  const [updateSessionControl] = useMutation(UPDATE_SESSION_CONTROL, {
    variables: {
      sessionId: SESSION_CONFIG.DEFAULT_SESSION_ID
    }
  });

  const { data: pageScrollData } = useSubscription(PAGE_SCROLL_SUBSCRIPTION, {
    variables: {
      sessionId: SESSION_CONFIG.DEFAULT_SESSION_ID
    },
    onData: ({ data }) => {
      console.log('Page scroll subscription data:', data);
    },
    onError: (error) => {
      console.error('Page scroll subscription error:', error);
    }
  });

  useEffect(() => {
    if (pageScrollData?.pageScrollUpdated?.scrollPosition && partnerRef.current) {
      partnerRef.current.scrollTo({
        top: pageScrollData.pageScrollUpdated.scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [pageScrollData, partnerRef]);

  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'token');
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (decoded.role === whoIsInControl) {
    return (
      <div ref={customerRef} style={{ height: '100vh', overflow: 'auto' }} onScroll={handleScroll}>
        <h1>In Control of Address Page</h1>
        <form>
          <label htmlFor='postCode'>Post Code</label>
          <input type="text" name="postCode" onChange={handleInput} helperText="Enter your post code" />
          <label htmlFor='yourAddress'>Password</label>
          <input type="password" name="yourAddress" onChange={handleInput} helperText="Enter your password" data-sensitive="true" />
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

  return (
    <div ref={partnerRef} style={{ height: '100vh', overflow: 'auto' }}>
      <h1>Not In Control of Address Page</h1>
      <p>Do you need control?</p>
      <button onClick={updateSessionControl}>Request Control</button>
      <form>
        <label htmlFor='postCode'>Post Code</label>
        <input type="text" name="postCode" title='postCode' value={formData.postCode} readOnly />
        <label htmlFor='yourAddress'>Password</label>
        <input type="password" name="yourAddress" title='yourAddress' value={formData.yourAddress} readOnly helperText="Enter your password" data-sensitive="true" />
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

export default App;