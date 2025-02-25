import { useRef } from 'react';
import { useMutation } from '@apollo/client';
import { PAGE_SCROLL_MUTATION } from '../graphQL';
import { jwtDecode } from 'jwt-decode';

export const useForm = (updateForm, whoIsInControl) => {
  const partnerRef = useRef(null);
  const customerRef = useRef(null);
  const [updatePageScroll] = useMutation(PAGE_SCROLL_MUTATION);
  let token = localStorage.getItem('token');
  const decoded = jwtDecode(token);

  const handleInput = async (e) => {
    console.log(e.target.name, e.target.value, e.target.dataset.sensitive, 'dataset');
    const isSensitive = e.target.dataset.sensitive === 'true';
    try {
      await updateForm({
        context: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
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
  };

  const handleScroll = async (e) => {
    const position = e.target.scrollTop;
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
  };

  return {
    customerRef,
    partnerRef,
    handleInput,
    handleScroll,
    decoded,
    updatePageScroll
  };
};