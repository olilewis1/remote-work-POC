import { gql } from '@apollo/client';

export const GET_DETAILS = gql`
  query GetDetails {
    details {
      firstName
      lastName
      email
    }
  }
`;

export const GET_SESSION = gql`
  query GetSession($sessionId: String!) {
    viewSession(sessionId: $sessionId) {
      sessionId
      whoIsInControl
    }
  }
`;

export const FORM_UPDATED_SUBSCRIPTION = gql`
  subscription OnFormUpdated {
    formUpdated {
      sessionId
      pages {
        addressForm {
          postCode
          yourAddress
        }
      }
    }
  }
`;

export const PAGE_SCROLL_SUBSCRIPTION = gql`
  subscription OnPageScroll($sessionId: String!) {
    pageScrollUpdated(sessionId: $sessionId) { 
      sessionId
      page
      scrollPosition
    }
  }
`;

export const PAGE_SCROLL_MUTATION = gql`
mutation PageScroll($sessionId: String!, $page: Int!, $scrollPosition: Float!) {
  updatePageScroll(sessionId: $sessionId, page: $page, scrollPosition: $scrollPosition) {
    sessionId
    page
    scrollPosition
  }
}`
export const UPDATE_FORM = gql`
  mutation UpdateForm($sessionId: String!, $key: String!, $value: String!, $form: String!) {
    updateForm(sessionId: $sessionId, key: $key, value: $value, form: $form) {
      sessionId
      pages {
        yourDetails {
          firstName
          lastName
          email
        }
        addressForm {
          postCode
          manualAddress
          yourAddress
          ownProperty
          myAddressNotListed
        }
      }
    }
  }
`;

 export const UPDATE_SESSION_CONTROL = gql`
mutation UpdateSessionControl($sessionId: String!) {
  updateSessionControl(sessionId: $sessionId) {
    whoIsInControl
  }
}
`;


export const SESSION_CONTROL_SUBSCRIPTION = gql`
  subscription OnSessionControlUpdated($sessionId: String!) {
    sessionControlUpdated(sessionId: $sessionId) {
      sessionId
      whoIsInControl  
    }
  }
`;