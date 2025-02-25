const typeDefs = `#graphql
type yourDetails { 
    firstName: String
    lastName: String
    email: String
    password: String
}
type addressForm { 
postCode: String
manualAddress: Boolean
yourAddress: String
ownProperty: Boolean
myAddressNotListed: Boolean
}

type pageScroll { 
    sessionId: String!
    page: Int!
    scrollPosition: Float!
}

type forms { 
    yourDetails: yourDetails
    addressForm: addressForm
}

enum ParticipantRole {
    PARTNER
    CUSTOMER
    SUPPORTING_PARTNER
}

type participant {
    role: ParticipantRole
}


type Session {
    sessionId: String
    sesssionType: String
    whoIsInControl: ParticipantRole
    participants: [participant]
    createdAt: String
    updatedAt: String
    page: Int
    pages: forms
}
type AuthPayload {
    token: String!
    user: yourDetails!
}

type JoinSessionResponse {
    session: Session!
    token: String!
}

type Query {
    details: yourDetails 
     viewSession(sessionId: String!): Session

}


type Mutation {
    addDetails(firstName: String, lastName: String): yourDetails
    updateDetails(key: String, value: String): yourDetails
    signup(email: String, password: String, firstName: String, lastName: String): AuthPayload
    login(sessionId: String!, role: ParticipantRole!, email: String!): AuthPayload
    createSession(sessionId: String, sessionType: String): Session
    updateSessionControl(sessionId: String): Session
    joinSession(sessionId: String, customerType: ParticipantRole): JoinSessionResponse
    updateForm(sessionId: String, key: String, value: String, form: String): Session
    updatePageScroll(sessionId: String!, page: Int!, scrollPosition: Float!): pageScroll
    }

type Subscription {
    detailsUpdated: yourDetails
    joinedSession: Session
    formUpdated: Session
    pageScrollUpdated(sessionId: String!): pageScroll
    sessionControlUpdated(sessionId: String!): Session
}
`;
export default typeDefs;
