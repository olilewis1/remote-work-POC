
enum  sessionType { 
    ONLINE,
    OFFLINE
}
enum participant { 
    PARTNER,
    CUSTOMER,
    SUPPORTING_PARTNER
}

type controlSettings = { 
    whoIsInControl: participant
}

type  session  = { 
    sessionId: string
    sesssionType: sessionType
    participants:  [participant]
    createdAt: string
    updatedAt: string
    page: number
}

type addressPage = { 
    postCode: string
    selected: boolean
}

type AddressForm = {
    type: String  
    searchPostcode: String
    selectedAddressId: String
    manualAddress: Boolean
  }

type yourDetailsForm = { 
    firstName: string
    lastName: string
    email: string
}

type energyForm = { 
    
}