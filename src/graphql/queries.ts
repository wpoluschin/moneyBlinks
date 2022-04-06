/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMBSettings = /* GraphQL */ `
  query GetMBSettings($id: ID!) {
    getMBSettings(id: $id) {
      id
      settings
      isActive
      alpha2Code
      alpha3Code
      platform
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBSettingss = /* GraphQL */ `
  query ListMBSettingss(
    $filter: ModelMBSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBSettingss(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        settings
        isActive
        alpha2Code
        alpha3Code
        platform
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBUser = /* GraphQL */ `
  query GetMBUser($id: ID!) {
    getMBUser(id: $id) {
      id
      type
      cognitoUserId
      nickname
      fullName
      email
      phoneNumber
      isAvailabilityTx
      checkEmail
      checkPhone
      locale
      createdAt
      updatedAt
      isTerms
      deletedAt
      identificationType
      identificationNumber
      currency
      alpha3Code
      alpha2Code
      avatarUrl
      oldAvatarUrl
      identificationUrl
      oldIdentificationUrl
      birthDate
      address
      city
      state
      zipCode
      country
      deviceToken
      isMFA
      isUpdateAccount
      acceptedRequestBlink
      isUsedMoneyBlinkAmount
      acceptedPromotionalInfo
      myPayments {
        nextToken
      }
      myBlinks {
        nextToken
      }
    }
  }
`;
export const listMBUsers = /* GraphQL */ `
  query ListMBUsers(
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const getMBContact = /* GraphQL */ `
  query GetMBContact($id: ID!) {
    getMBContact(id: $id) {
      id
      invitingID
      invitedID
      invited {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      isFavorite
      myShipments
      myReceipts
      codeID
      moneyBlinksCode {
        id
        userID
        code
        codeType
        isUsed
        isUserUsed
        createdAt
        updatedAt
        deletedAt
      }
      code
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBContacts = /* GraphQL */ `
  query ListMBContacts(
    $filter: ModelMBContactFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBContacts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        invitingID
        invitedID
        isFavorite
        myShipments
        myReceipts
        codeID
        code
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBCode = /* GraphQL */ `
  query GetMBCode($id: ID!) {
    getMBCode(id: $id) {
      id
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      code
      codeType
      isUsed
      isUserUsed
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBCodes = /* GraphQL */ `
  query ListMBCodes(
    $filter: ModelMBCodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBCodes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        code
        codeType
        isUsed
        isUserUsed
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBCountry = /* GraphQL */ `
  query GetMBCountry($id: ID!) {
    getMBCountry(id: $id) {
      id
      type
      name
      translate
      settings
      alpha3Code
      alpha2Code
      showOrder
      isDownload
      currency
      isActive
      countryStateId
      country {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      createdAt
      updatedAt
      deletedAt
      taxes {
        nextToken
      }
      charges {
        nextToken
      }
    }
  }
`;
export const listMBCountrys = /* GraphQL */ `
  query ListMBCountrys(
    $filter: ModelMBCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBCountrys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBPaymentMethod = /* GraphQL */ `
  query GetMBPaymentMethod($id: ID!) {
    getMBPaymentMethod(id: $id) {
      id
      name
      code
      translate
      createdAt
      updatedAt
      deletedAt
      countries {
        nextToken
      }
    }
  }
`;
export const listMBPaymentMethods = /* GraphQL */ `
  query ListMBPaymentMethods(
    $filter: ModelMBPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBPaymentMethods(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        code
        translate
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBPaymentMethodCountry = /* GraphQL */ `
  query GetMBPaymentMethodCountry($id: ID!) {
    getMBPaymentMethodCountry(id: $id) {
      id
      paymentMethodID
      costCenterID
      paymentMethod {
        id
        name
        code
        translate
        createdAt
        updatedAt
        deletedAt
      }
      costCenter {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      settings
      isActive
      paymentTypeCode
      alpha2Code
      alpha3Code
      isReceipt
      isShipping
      createdAt
      updatedAt
      availableFromAt
      availableUntilAt
      users {
        nextToken
      }
    }
  }
`;
export const listMBPaymentMethodCountrys = /* GraphQL */ `
  query ListMBPaymentMethodCountrys(
    $filter: ModelMBPaymentMethodCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBPaymentMethodCountrys(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodID
        costCenterID
        settings
        isActive
        paymentTypeCode
        alpha2Code
        alpha3Code
        isReceipt
        isShipping
        createdAt
        updatedAt
        availableFromAt
        availableUntilAt
      }
      nextToken
    }
  }
`;
export const getMBMyPaymentMethod = /* GraphQL */ `
  query GetMBMyPaymentMethod($id: ID!) {
    getMBMyPaymentMethod(id: $id) {
      id
      paymentMethodCountryID
      userID
      paymentMethodCountry {
        id
        paymentMethodID
        costCenterID
        settings
        isActive
        paymentTypeCode
        alpha2Code
        alpha3Code
        isReceipt
        isShipping
        createdAt
        updatedAt
        availableFromAt
        availableUntilAt
      }
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      accountId
      value
      label
      settings
      payType
      isActive
      isUsedPayment
      description
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBMyPaymentMethods = /* GraphQL */ `
  query ListMBMyPaymentMethods(
    $filter: ModelMBMyPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBMyPaymentMethods(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodCountryID
        userID
        accountId
        value
        label
        settings
        payType
        isActive
        isUsedPayment
        description
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBBlinkSettings = /* GraphQL */ `
  query GetMBBlinkSettings($id: ID!) {
    getMBBlinkSettings(id: $id) {
      id
      type
      countryID
      isoStateCode
      country {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      blinkCost
      promotionalCount
      currency
      settings
      createdAt
      updatedAt
      deletedAt
      blinksByUser {
        nextToken
      }
    }
  }
`;
export const listMBBlinkSettingss = /* GraphQL */ `
  query ListMBBlinkSettingss(
    $filter: ModelMBBlinkSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBBlinkSettingss(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        countryID
        isoStateCode
        blinkCost
        promotionalCount
        currency
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBBlinkUser = /* GraphQL */ `
  query GetMBBlinkUser($id: ID!) {
    getMBBlinkUser(id: $id) {
      id
      userID
      blinkSettingID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      blinkSetting {
        id
        type
        countryID
        isoStateCode
        blinkCost
        promotionalCount
        currency
        settings
        createdAt
        updatedAt
        deletedAt
      }
      blinkAcquired
      blinkAvailable
      blinkPrice
      isPromotional
      currency
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBBlinkUsers = /* GraphQL */ `
  query ListMBBlinkUsers(
    $filter: ModelMBBlinkUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBBlinkUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        blinkSettingID
        blinkAcquired
        blinkAvailable
        blinkPrice
        isPromotional
        currency
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBPay = /* GraphQL */ `
  query GetMBPay($id: ID!) {
    getMBPay(id: $id) {
      id
      type
      amount
      currency
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      paymentMethodCountry
      paymentID
      paymentMethod {
        id
        paymentMethodCountryID
        userID
        accountId
        value
        label
        settings
        payType
        isActive
        isUsedPayment
        description
        createdAt
        updatedAt
        deletedAt
      }
      exchangeAmount
      exchangeRate
      exchangeCurrency
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBPays = /* GraphQL */ `
  query ListMBPays(
    $filter: ModelMBPayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBPays(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        amount
        currency
        userID
        paymentMethodCountry
        paymentID
        exchangeAmount
        exchangeRate
        exchangeCurrency
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBTransaction = /* GraphQL */ `
  query GetMBTransaction($id: ID!) {
    getMBTransaction(id: $id) {
      id
      type
      createdAt
      updatedAt
      deletedAt
      amount
      currency
      taxes
      charges
      amountDeposit
      currencyDeposit
      message
      requestMessage
      txType
      txStatus
      shippingID
      shipping {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      receiptID
      receipt {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      codeID
      moneyBlinksCode {
        id
        userID
        code
        codeType
        isUsed
        isUserUsed
        createdAt
        updatedAt
        deletedAt
      }
      isConfirm
      isReceipt
      txValues
      downloads {
        nextToken
      }
    }
  }
`;
export const listMBTransactions = /* GraphQL */ `
  query ListMBTransactions(
    $filter: ModelMBTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBTransactions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        createdAt
        updatedAt
        deletedAt
        amount
        currency
        taxes
        charges
        amountDeposit
        currencyDeposit
        message
        requestMessage
        txType
        txStatus
        shippingID
        receiptID
        codeID
        isConfirm
        isReceipt
        txValues
      }
      nextToken
    }
  }
`;
export const getMBFinancialData = /* GraphQL */ `
  query GetMBFinancialData($id: ID!) {
    getMBFinancialData(id: $id) {
      id
      type
      amount
      currency
      blinks
      isActive
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBFinancialDatas = /* GraphQL */ `
  query ListMBFinancialDatas(
    $filter: ModelMBFinancialDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBFinancialDatas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        amount
        currency
        blinks
        isActive
        userID
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBBlinkPay = /* GraphQL */ `
  query GetMBBlinkPay($id: ID!) {
    getMBBlinkPay(id: $id) {
      id
      type
      payID
      payment {
        id
        type
        amount
        currency
        userID
        paymentMethodCountry
        paymentID
        exchangeAmount
        exchangeRate
        exchangeCurrency
        createdAt
        updatedAt
        deletedAt
      }
      blinkID
      blink {
        id
        userID
        blinkSettingID
        blinkAcquired
        blinkAvailable
        blinkPrice
        isPromotional
        currency
        createdAt
        updatedAt
        deletedAt
      }
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      createdAt
      updatedAt
    }
  }
`;
export const listMBBlinkPays = /* GraphQL */ `
  query ListMBBlinkPays(
    $filter: ModelMBBlinkPayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBBlinkPays(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        payID
        blinkID
        userID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getMBTransactionPay = /* GraphQL */ `
  query GetMBTransactionPay($id: ID!) {
    getMBTransactionPay(id: $id) {
      id
      type
      payID
      payment {
        id
        type
        amount
        currency
        userID
        paymentMethodCountry
        paymentID
        exchangeAmount
        exchangeRate
        exchangeCurrency
        createdAt
        updatedAt
        deletedAt
      }
      txID
      tx {
        id
        type
        createdAt
        updatedAt
        deletedAt
        amount
        currency
        taxes
        charges
        amountDeposit
        currencyDeposit
        message
        requestMessage
        txType
        txStatus
        shippingID
        receiptID
        codeID
        isConfirm
        isReceipt
        txValues
      }
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      createdAt
      updatedAt
    }
  }
`;
export const listMBTransactionPays = /* GraphQL */ `
  query ListMBTransactionPays(
    $filter: ModelMBTransactionPayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBTransactionPays(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        payID
        txID
        userID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getMBTaxCountry = /* GraphQL */ `
  query GetMBTaxCountry($id: ID!) {
    getMBTaxCountry(id: $id) {
      id
      countryID
      country {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      taxCode
      translate
      isActive
      currency
      showOrder
      isReceipt
      isBlinkPay
      isShipping
      total
      settings
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBTaxCountrys = /* GraphQL */ `
  query ListMBTaxCountrys(
    $filter: ModelMBTaxCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBTaxCountrys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        countryID
        taxCode
        translate
        isActive
        currency
        showOrder
        isReceipt
        isBlinkPay
        isShipping
        total
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBChargeCountry = /* GraphQL */ `
  query GetMBChargeCountry($id: ID!) {
    getMBChargeCountry(id: $id) {
      id
      countryID
      country {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      chargeCode
      translate
      isActive
      currency
      showOrder
      isReceipt
      isBlinkPay
      isShipping
      total
      settings
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const listMBChargeCountrys = /* GraphQL */ `
  query ListMBChargeCountrys(
    $filter: ModelMBChargeCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBChargeCountrys(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        countryID
        chargeCode
        translate
        isActive
        currency
        showOrder
        isReceipt
        isBlinkPay
        isShipping
        total
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const getMBDownloadBlink = /* GraphQL */ `
  query GetMBDownloadBlink($id: ID!) {
    getMBDownloadBlink(id: $id) {
      id
      type
      txID
      tx {
        id
        type
        createdAt
        updatedAt
        deletedAt
        amount
        currency
        taxes
        charges
        amountDeposit
        currencyDeposit
        message
        requestMessage
        txType
        txStatus
        shippingID
        receiptID
        codeID
        isConfirm
        isReceipt
        txValues
      }
      createdAt
      updatedAt
      deletedAt
      processAt
      paymentMethod
      paymentMethodId
      stateCode
      batchCatch
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      amount
      currency
    }
  }
`;
export const listMBDownloadBlinks = /* GraphQL */ `
  query ListMBDownloadBlinks(
    $filter: ModelMBDownloadBlinkFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBDownloadBlinks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        txID
        createdAt
        updatedAt
        deletedAt
        processAt
        paymentMethod
        paymentMethodId
        stateCode
        batchCatch
        userID
        amount
        currency
      }
      nextToken
    }
  }
`;
export const getMBNotification = /* GraphQL */ `
  query GetMBNotification($id: ID!) {
    getMBNotification(id: $id) {
      id
      type
      createdAt
      updatedAt
      isRead
      data
      title
      message
      userID
      user {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
    }
  }
`;
export const listMBNotifications = /* GraphQL */ `
  query ListMBNotifications(
    $filter: ModelMBNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMBNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        createdAt
        updatedAt
        isRead
        data
        title
        message
        userID
      }
      nextToken
    }
  }
`;
export const getFileUploadBank = /* GraphQL */ `
  query GetFileUploadBank($id: ID!) {
    getFileUploadBank(id: $id) {
      id
      fileType
      type
      fileName
      location
      createdAt
      updatedAt
      isDownload
      processedBy
      processedAt
    }
  }
`;
export const listFileUploadBanks = /* GraphQL */ `
  query ListFileUploadBanks(
    $filter: ModelFileUploadBankFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFileUploadBanks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fileType
        type
        fileName
        location
        createdAt
        updatedAt
        isDownload
        processedBy
        processedAt
      }
      nextToken
    }
  }
`;
export const byPhoneNumber = /* GraphQL */ `
  query ByPhoneNumber(
    $phoneNumber: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byPhoneNumber(
      phoneNumber: $phoneNumber
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const byEmail = /* GraphQL */ `
  query ByEmail(
    $email: AWSEmail
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byEmail(
      email: $email
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const byIdentification = /* GraphQL */ `
  query ByIdentification(
    $identificationNumber: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byIdentification(
      identificationNumber: $identificationNumber
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const byNickname = /* GraphQL */ `
  query ByNickname(
    $nickname: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byNickname(
      nickname: $nickname
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const listAllUsers = /* GraphQL */ `
  query ListAllUsers(
    $type: String
    $fullName: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAllUsers(
      type: $type
      fullName: $fullName
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoUserId
        nickname
        fullName
        email
        phoneNumber
        isAvailabilityTx
        checkEmail
        checkPhone
        locale
        createdAt
        updatedAt
        isTerms
        deletedAt
        identificationType
        identificationNumber
        currency
        alpha3Code
        alpha2Code
        avatarUrl
        oldAvatarUrl
        identificationUrl
        oldIdentificationUrl
        birthDate
        address
        city
        state
        zipCode
        country
        deviceToken
        isMFA
        isUpdateAccount
        acceptedRequestBlink
        isUsedMoneyBlinkAmount
        acceptedPromotionalInfo
      }
      nextToken
    }
  }
`;
export const myShipmentsFrequents = /* GraphQL */ `
  query MyShipmentsFrequents(
    $invitingID: ID
    $myShipments: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBContactFilterInput
    $limit: Int
    $nextToken: String
  ) {
    myShipmentsFrequents(
      invitingID: $invitingID
      myShipments: $myShipments
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        invitingID
        invitedID
        isFavorite
        myShipments
        myReceipts
        codeID
        code
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const myRequestsFrequents = /* GraphQL */ `
  query MyRequestsFrequents(
    $invitingID: ID
    $myReceipts: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBContactFilterInput
    $limit: Int
    $nextToken: String
  ) {
    myRequestsFrequents(
      invitingID: $invitingID
      myReceipts: $myReceipts
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        invitingID
        invitedID
        isFavorite
        myShipments
        myReceipts
        codeID
        code
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const costCenterAlpha3Code = /* GraphQL */ `
  query CostCenterAlpha3Code(
    $alpha3Code: String
    $sortDirection: ModelSortDirection
    $filter: ModelMBCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    costCenterAlpha3Code(
      alpha3Code: $alpha3Code
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const costCenterAlpha2Code = /* GraphQL */ `
  query CostCenterAlpha2Code(
    $alpha2Code: String
    $sortDirection: ModelSortDirection
    $filter: ModelMBCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    costCenterAlpha2Code(
      alpha2Code: $alpha2Code
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const listByNameOrOrder = /* GraphQL */ `
  query ListByNameOrOrder(
    $type: String
    $showOrder: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listByNameOrOrder(
      type: $type
      showOrder: $showOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        name
        translate
        settings
        alpha3Code
        alpha2Code
        showOrder
        isDownload
        currency
        isActive
        countryStateId
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const paymentMethodByCode = /* GraphQL */ `
  query PaymentMethodByCode(
    $code: String
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentMethodByCode(
      code: $code
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        code
        translate
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const byPaymentMethod = /* GraphQL */ `
  query ByPaymentMethod(
    $paymentMethodID: ID
    $costCenterIDAvailableFromAt: ModelMBPaymentMethodCountryByPaymentMethodCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBPaymentMethodCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byPaymentMethod(
      paymentMethodID: $paymentMethodID
      costCenterIDAvailableFromAt: $costCenterIDAvailableFromAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodID
        costCenterID
        settings
        isActive
        paymentTypeCode
        alpha2Code
        alpha3Code
        isReceipt
        isShipping
        createdAt
        updatedAt
        availableFromAt
        availableUntilAt
      }
      nextToken
    }
  }
`;
export const byCostCenter = /* GraphQL */ `
  query ByCostCenter(
    $costCenterID: ID
    $paymentMethodIDAvailableFromAt: ModelMBPaymentMethodCountryByCostCenterCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBPaymentMethodCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byCostCenter(
      costCenterID: $costCenterID
      paymentMethodIDAvailableFromAt: $paymentMethodIDAvailableFromAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodID
        costCenterID
        settings
        isActive
        paymentTypeCode
        alpha2Code
        alpha3Code
        isReceipt
        isShipping
        createdAt
        updatedAt
        availableFromAt
        availableUntilAt
      }
      nextToken
    }
  }
`;
export const byPaymentUser = /* GraphQL */ `
  query ByPaymentUser(
    $userID: ID
    $paymentMethodCountryIDCreatedAt: ModelMBMyPaymentMethodByPaymentUserCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBMyPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byPaymentUser(
      userID: $userID
      paymentMethodCountryIDCreatedAt: $paymentMethodCountryIDCreatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodCountryID
        userID
        accountId
        value
        label
        settings
        payType
        isActive
        isUsedPayment
        description
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const myMethodsByCountry = /* GraphQL */ `
  query MyMethodsByCountry(
    $paymentMethodCountryID: ID
    $userIDCreatedAt: ModelMBMyPaymentMethodMyMethodsByCountryCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBMyPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    myMethodsByCountry(
      paymentMethodCountryID: $paymentMethodCountryID
      userIDCreatedAt: $userIDCreatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodCountryID
        userID
        accountId
        value
        label
        settings
        payType
        isActive
        isUsedPayment
        description
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const paymentByType = /* GraphQL */ `
  query PaymentByType(
    $payType: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBMyPaymentMethodFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentByType(
      payType: $payType
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        paymentMethodCountryID
        userID
        accountId
        value
        label
        settings
        payType
        isActive
        isUsedPayment
        description
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const byBlinkCountryId = /* GraphQL */ `
  query ByBlinkCountryId(
    $countryID: ID
    $isoStateCode: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBBlinkSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byBlinkCountryId(
      countryID: $countryID
      isoStateCode: $isoStateCode
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        countryID
        isoStateCode
        blinkCost
        promotionalCount
        currency
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const lastBlinkSettings = /* GraphQL */ `
  query LastBlinkSettings(
    $type: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBBlinkSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    lastBlinkSettings(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        countryID
        isoStateCode
        blinkCost
        promotionalCount
        currency
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const byUserIdBlinks = /* GraphQL */ `
  query ByUserIdBlinks(
    $userID: ID
    $blinkSettingID: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBBlinkUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byUserIdBlinks(
      userID: $userID
      blinkSettingID: $blinkSettingID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        blinkSettingID
        blinkAcquired
        blinkAvailable
        blinkPrice
        isPromotional
        currency
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const byBlinksGetUser = /* GraphQL */ `
  query ByBlinksGetUser(
    $blinkSettingID: ID
    $userID: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBBlinkUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    byBlinksGetUser(
      blinkSettingID: $blinkSettingID
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        blinkSettingID
        blinkAcquired
        blinkAvailable
        blinkPrice
        isPromotional
        currency
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const listAll = /* GraphQL */ `
  query ListAll(
    $type: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAll(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        createdAt
        updatedAt
        deletedAt
        amount
        currency
        taxes
        charges
        amountDeposit
        currencyDeposit
        message
        requestMessage
        txType
        txStatus
        shippingID
        receiptID
        codeID
        isConfirm
        isReceipt
        txValues
      }
      nextToken
    }
  }
`;
export const listAllBlinkPays = /* GraphQL */ `
  query ListAllBlinkPays(
    $type: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBBlinkPayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAllBlinkPays(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        payID
        blinkID
        userID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const listAllTxPays = /* GraphQL */ `
  query ListAllTxPays(
    $type: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBTransactionPayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAllTxPays(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        payID
        txID
        userID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const listTaxesByCountryId = /* GraphQL */ `
  query ListTaxesByCountryId(
    $countryID: ID
    $showOrder: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBTaxCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTaxesByCountryId(
      countryID: $countryID
      showOrder: $showOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        countryID
        taxCode
        translate
        isActive
        currency
        showOrder
        isReceipt
        isBlinkPay
        isShipping
        total
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const listChargesByCountryId = /* GraphQL */ `
  query ListChargesByCountryId(
    $countryID: ID
    $showOrder: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBChargeCountryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChargesByCountryId(
      countryID: $countryID
      showOrder: $showOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        countryID
        chargeCode
        translate
        isActive
        currency
        showOrder
        isReceipt
        isBlinkPay
        isShipping
        total
        settings
        createdAt
        updatedAt
        deletedAt
      }
      nextToken
    }
  }
`;
export const downloadByTx = /* GraphQL */ `
  query DownloadByTx(
    $txID: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBDownloadBlinkFilterInput
    $limit: Int
    $nextToken: String
  ) {
    downloadByTx(
      txID: $txID
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        txID
        createdAt
        updatedAt
        deletedAt
        processAt
        paymentMethod
        paymentMethodId
        stateCode
        batchCatch
        userID
        amount
        currency
      }
      nextToken
    }
  }
`;
export const listMyNotifications = /* GraphQL */ `
  query ListMyNotifications(
    $type: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMBNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMyNotifications(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        createdAt
        updatedAt
        isRead
        data
        title
        message
        userID
      }
      nextToken
    }
  }
`;
export const listFilesEC = /* GraphQL */ `
  query ListFilesEC(
    $fileType: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFileUploadBankFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFilesEC(
      fileType: $fileType
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        fileType
        type
        fileName
        location
        createdAt
        updatedAt
        isDownload
        processedBy
        processedAt
      }
      nextToken
    }
  }
`;
