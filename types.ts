export enum ParticipantRole { 
    PARTNER = "PARTNER",
    CUSTOMER = "CUSTOMER",
    SUPPORTING_PARTNER = "SUPPORTING_PARTNER"
}

export enum loginType {
    CUSTOMER = "CUSTOMER",
    PARTNER = "PARTNER"
}

export type participant = {
    role: ParticipantRole
}

export interface Details {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    [key: string]: string;
}

export interface addressForm {
    postCode: string;
    manualAddress: boolean;
    yourAddress: string;
    ownProperty: boolean;
    myAddressNotListed: boolean
}

export interface Context {
    user?: Details | null;
    token?: string;
}

export interface FormData {
    yourDetails: Details;
    addressForm: addressForm;
}

export type FormTypes = keyof FormData;

export type sessionType = {
    sessionId: string;
    sesssionType: string;
    whoIsInControl: ParticipantRole;
    participants: { role: ParticipantRole }[]
    createdAt: string;
    updatedAt: string;
    page: number;
    pages: FormData;
}

export  type JoinSessionResponse =  {
    session: sessionType
    token: String
}