import { useState, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { UPDATE_FORM, FORM_UPDATED_SUBSCRIPTION } from '../graphQL';

export const useFormData = () => {
  const [formData, setFormData] = useState({
    postCode: '',
    ownProperty: false,
    myAddressNotListed: false
  });

  const [updateForm] = useMutation(UPDATE_FORM);

  const { data: subData, loading: subLoading, error: subError } = useSubscription(FORM_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('Subscription received data:', data);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  useEffect(() => {
    if (subData?.formUpdated?.pages?.addressForm) {
      setFormData({
        postCode: subData.formUpdated.pages.addressForm.postCode,
        ownProperty: subData.formUpdated.pages.addressForm.ownProperty,
        myAddressNotListed: subData.formUpdated.pages.addressForm.myAddressNotListed,
        yourAddress: subData.formUpdated.pages.addressForm.yourAddress
      });
    }
  }, [subData]);

  return { formData, setFormData, updateForm, subData, subLoading, subError };
};