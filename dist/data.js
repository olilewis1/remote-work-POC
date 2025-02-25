import { ParticipantRole } from './types.js';
export const yourDetails = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password",
    role: ParticipantRole.PARTNER
};
const addressForm = {
    postCode: "",
    manualAddress: false,
    yourAddress: "",
    ownProperty: false,
    myAddressNotListed: false
};
export const forms = {
    yourDetails: yourDetails,
    addressForm: addressForm
};
export const sessions = [
    {
        sessionId: "1",
        sesssionType: "1v1",
        whoIsInControl: ParticipantRole.PARTNER,
        participants: [{ role: ParticipantRole.PARTNER }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        page: 1,
        pages: forms
    }
];
