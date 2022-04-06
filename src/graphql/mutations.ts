/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTx = /* GraphQL */ `
  mutation CreateTx($values: AWSJSON) {
    createTx(values: $values)
  }
`;
export const createPay = /* GraphQL */ `
  mutation CreatePay($payInput: AWSJSON) {
    createPay(payInput: $payInput)
  }
`;
export const purchasePack = /* GraphQL */ `
  mutation PurchasePack($values: AWSJSON) {
    purchasePack(values: $values)
  }
`;
export const completeTx = /* GraphQL */ `
  mutation CompleteTx($values: AWSJSON) {
    completeTx(values: $values)
  }
`;
export const createOrValidateCode = /* GraphQL */ `
  mutation CreateOrValidateCode($values: AWSJSON) {
    createOrValidateCode(values: $values)
  }
`;
export const validateCode = /* GraphQL */ `
  mutation ValidateCode($values: AWSJSON) {
    validateCode(values: $values)
  }
`;
export const upDownCash = /* GraphQL */ `
  mutation UpDownCash($values: AWSJSON) {
    upDownCash(values: $values)
  }
`;
export const rewardsPlans = /* GraphQL */ `
  mutation RewardsPlans($values: AWSJSON) {
    rewardsPlans(values: $values)
  }
`;
export const bankEc = /* GraphQL */ `
  mutation BankEc {
    bankEc
  }
`;
export const createMBSettings = /* GraphQL */ `
  mutation CreateMBSettings(
    $input: CreateMBSettingsInput!
    $condition: ModelMBSettingsConditionInput
  ) {
    createMBSettings(input: $input, condition: $condition) {
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
export const updateMBSettings = /* GraphQL */ `
  mutation UpdateMBSettings(
    $input: UpdateMBSettingsInput!
    $condition: ModelMBSettingsConditionInput
  ) {
    updateMBSettings(input: $input, condition: $condition) {
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
export const deleteMBSettings = /* GraphQL */ `
  mutation DeleteMBSettings(
    $input: DeleteMBSettingsInput!
    $condition: ModelMBSettingsConditionInput
  ) {
    deleteMBSettings(input: $input, condition: $condition) {
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
export const createMBUser = /* GraphQL */ `
  mutation CreateMBUser(
    $input: CreateMBUserInput!
    $condition: ModelMBUserConditionInput
  ) {
    createMBUser(input: $input, condition: $condition) {
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
export const updateMBUser = /* GraphQL */ `
  mutation UpdateMBUser(
    $input: UpdateMBUserInput!
    $condition: ModelMBUserConditionInput
  ) {
    updateMBUser(input: $input, condition: $condition) {
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
export const deleteMBUser = /* GraphQL */ `
  mutation DeleteMBUser(
    $input: DeleteMBUserInput!
    $condition: ModelMBUserConditionInput
  ) {
    deleteMBUser(input: $input, condition: $condition) {
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
export const createMBContact = /* GraphQL */ `
  mutation CreateMBContact(
    $input: CreateMBContactInput!
    $condition: ModelMBContactConditionInput
  ) {
    createMBContact(input: $input, condition: $condition) {
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
export const updateMBContact = /* GraphQL */ `
  mutation UpdateMBContact(
    $input: UpdateMBContactInput!
    $condition: ModelMBContactConditionInput
  ) {
    updateMBContact(input: $input, condition: $condition) {
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
export const deleteMBContact = /* GraphQL */ `
  mutation DeleteMBContact(
    $input: DeleteMBContactInput!
    $condition: ModelMBContactConditionInput
  ) {
    deleteMBContact(input: $input, condition: $condition) {
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
export const createMBCode = /* GraphQL */ `
  mutation CreateMBCode(
    $input: CreateMBCodeInput!
    $condition: ModelMBCodeConditionInput
  ) {
    createMBCode(input: $input, condition: $condition) {
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
export const updateMBCode = /* GraphQL */ `
  mutation UpdateMBCode(
    $input: UpdateMBCodeInput!
    $condition: ModelMBCodeConditionInput
  ) {
    updateMBCode(input: $input, condition: $condition) {
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
export const deleteMBCode = /* GraphQL */ `
  mutation DeleteMBCode(
    $input: DeleteMBCodeInput!
    $condition: ModelMBCodeConditionInput
  ) {
    deleteMBCode(input: $input, condition: $condition) {
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
export const createMBCountry = /* GraphQL */ `
  mutation CreateMBCountry(
    $input: CreateMBCountryInput!
    $condition: ModelMBCountryConditionInput
  ) {
    createMBCountry(input: $input, condition: $condition) {
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
export const updateMBCountry = /* GraphQL */ `
  mutation UpdateMBCountry(
    $input: UpdateMBCountryInput!
    $condition: ModelMBCountryConditionInput
  ) {
    updateMBCountry(input: $input, condition: $condition) {
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
export const deleteMBCountry = /* GraphQL */ `
  mutation DeleteMBCountry(
    $input: DeleteMBCountryInput!
    $condition: ModelMBCountryConditionInput
  ) {
    deleteMBCountry(input: $input, condition: $condition) {
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
export const createMBPaymentMethod = /* GraphQL */ `
  mutation CreateMBPaymentMethod(
    $input: CreateMBPaymentMethodInput!
    $condition: ModelMBPaymentMethodConditionInput
  ) {
    createMBPaymentMethod(input: $input, condition: $condition) {
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
export const updateMBPaymentMethod = /* GraphQL */ `
  mutation UpdateMBPaymentMethod(
    $input: UpdateMBPaymentMethodInput!
    $condition: ModelMBPaymentMethodConditionInput
  ) {
    updateMBPaymentMethod(input: $input, condition: $condition) {
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
export const deleteMBPaymentMethod = /* GraphQL */ `
  mutation DeleteMBPaymentMethod(
    $input: DeleteMBPaymentMethodInput!
    $condition: ModelMBPaymentMethodConditionInput
  ) {
    deleteMBPaymentMethod(input: $input, condition: $condition) {
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
export const createMBPaymentMethodCountry = /* GraphQL */ `
  mutation CreateMBPaymentMethodCountry(
    $input: CreateMBPaymentMethodCountryInput!
    $condition: ModelMBPaymentMethodCountryConditionInput
  ) {
    createMBPaymentMethodCountry(input: $input, condition: $condition) {
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
export const updateMBPaymentMethodCountry = /* GraphQL */ `
  mutation UpdateMBPaymentMethodCountry(
    $input: UpdateMBPaymentMethodCountryInput!
    $condition: ModelMBPaymentMethodCountryConditionInput
  ) {
    updateMBPaymentMethodCountry(input: $input, condition: $condition) {
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
export const deleteMBPaymentMethodCountry = /* GraphQL */ `
  mutation DeleteMBPaymentMethodCountry(
    $input: DeleteMBPaymentMethodCountryInput!
    $condition: ModelMBPaymentMethodCountryConditionInput
  ) {
    deleteMBPaymentMethodCountry(input: $input, condition: $condition) {
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
export const createMBMyPaymentMethod = /* GraphQL */ `
  mutation CreateMBMyPaymentMethod(
    $input: CreateMBMyPaymentMethodInput!
    $condition: ModelMBMyPaymentMethodConditionInput
  ) {
    createMBMyPaymentMethod(input: $input, condition: $condition) {
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
export const updateMBMyPaymentMethod = /* GraphQL */ `
  mutation UpdateMBMyPaymentMethod(
    $input: UpdateMBMyPaymentMethodInput!
    $condition: ModelMBMyPaymentMethodConditionInput
  ) {
    updateMBMyPaymentMethod(input: $input, condition: $condition) {
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
export const deleteMBMyPaymentMethod = /* GraphQL */ `
  mutation DeleteMBMyPaymentMethod(
    $input: DeleteMBMyPaymentMethodInput!
    $condition: ModelMBMyPaymentMethodConditionInput
  ) {
    deleteMBMyPaymentMethod(input: $input, condition: $condition) {
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
export const createMBBlinkSettings = /* GraphQL */ `
  mutation CreateMBBlinkSettings(
    $input: CreateMBBlinkSettingsInput!
    $condition: ModelMBBlinkSettingsConditionInput
  ) {
    createMBBlinkSettings(input: $input, condition: $condition) {
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
export const updateMBBlinkSettings = /* GraphQL */ `
  mutation UpdateMBBlinkSettings(
    $input: UpdateMBBlinkSettingsInput!
    $condition: ModelMBBlinkSettingsConditionInput
  ) {
    updateMBBlinkSettings(input: $input, condition: $condition) {
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
export const deleteMBBlinkSettings = /* GraphQL */ `
  mutation DeleteMBBlinkSettings(
    $input: DeleteMBBlinkSettingsInput!
    $condition: ModelMBBlinkSettingsConditionInput
  ) {
    deleteMBBlinkSettings(input: $input, condition: $condition) {
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
export const createMBBlinkUser = /* GraphQL */ `
  mutation CreateMBBlinkUser(
    $input: CreateMBBlinkUserInput!
    $condition: ModelMBBlinkUserConditionInput
  ) {
    createMBBlinkUser(input: $input, condition: $condition) {
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
export const updateMBBlinkUser = /* GraphQL */ `
  mutation UpdateMBBlinkUser(
    $input: UpdateMBBlinkUserInput!
    $condition: ModelMBBlinkUserConditionInput
  ) {
    updateMBBlinkUser(input: $input, condition: $condition) {
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
export const deleteMBBlinkUser = /* GraphQL */ `
  mutation DeleteMBBlinkUser(
    $input: DeleteMBBlinkUserInput!
    $condition: ModelMBBlinkUserConditionInput
  ) {
    deleteMBBlinkUser(input: $input, condition: $condition) {
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
export const createMBPay = /* GraphQL */ `
  mutation CreateMBPay(
    $input: CreateMBPayInput!
    $condition: ModelMBPayConditionInput
  ) {
    createMBPay(input: $input, condition: $condition) {
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
export const updateMBPay = /* GraphQL */ `
  mutation UpdateMBPay(
    $input: UpdateMBPayInput!
    $condition: ModelMBPayConditionInput
  ) {
    updateMBPay(input: $input, condition: $condition) {
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
export const deleteMBPay = /* GraphQL */ `
  mutation DeleteMBPay(
    $input: DeleteMBPayInput!
    $condition: ModelMBPayConditionInput
  ) {
    deleteMBPay(input: $input, condition: $condition) {
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
export const createMBTransaction = /* GraphQL */ `
  mutation CreateMBTransaction(
    $input: CreateMBTransactionInput!
    $condition: ModelMBTransactionConditionInput
  ) {
    createMBTransaction(input: $input, condition: $condition) {
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
export const updateMBTransaction = /* GraphQL */ `
  mutation UpdateMBTransaction(
    $input: UpdateMBTransactionInput!
    $condition: ModelMBTransactionConditionInput
  ) {
    updateMBTransaction(input: $input, condition: $condition) {
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
export const deleteMBTransaction = /* GraphQL */ `
  mutation DeleteMBTransaction(
    $input: DeleteMBTransactionInput!
    $condition: ModelMBTransactionConditionInput
  ) {
    deleteMBTransaction(input: $input, condition: $condition) {
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
export const createMBFinancialData = /* GraphQL */ `
  mutation CreateMBFinancialData(
    $input: CreateMBFinancialDataInput!
    $condition: ModelMBFinancialDataConditionInput
  ) {
    createMBFinancialData(input: $input, condition: $condition) {
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
export const updateMBFinancialData = /* GraphQL */ `
  mutation UpdateMBFinancialData(
    $input: UpdateMBFinancialDataInput!
    $condition: ModelMBFinancialDataConditionInput
  ) {
    updateMBFinancialData(input: $input, condition: $condition) {
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
export const deleteMBFinancialData = /* GraphQL */ `
  mutation DeleteMBFinancialData(
    $input: DeleteMBFinancialDataInput!
    $condition: ModelMBFinancialDataConditionInput
  ) {
    deleteMBFinancialData(input: $input, condition: $condition) {
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
export const createMBBlinkPay = /* GraphQL */ `
  mutation CreateMBBlinkPay(
    $input: CreateMBBlinkPayInput!
    $condition: ModelMBBlinkPayConditionInput
  ) {
    createMBBlinkPay(input: $input, condition: $condition) {
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
export const updateMBBlinkPay = /* GraphQL */ `
  mutation UpdateMBBlinkPay(
    $input: UpdateMBBlinkPayInput!
    $condition: ModelMBBlinkPayConditionInput
  ) {
    updateMBBlinkPay(input: $input, condition: $condition) {
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
export const deleteMBBlinkPay = /* GraphQL */ `
  mutation DeleteMBBlinkPay(
    $input: DeleteMBBlinkPayInput!
    $condition: ModelMBBlinkPayConditionInput
  ) {
    deleteMBBlinkPay(input: $input, condition: $condition) {
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
export const createMBTransactionPay = /* GraphQL */ `
  mutation CreateMBTransactionPay(
    $input: CreateMBTransactionPayInput!
    $condition: ModelMBTransactionPayConditionInput
  ) {
    createMBTransactionPay(input: $input, condition: $condition) {
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
export const updateMBTransactionPay = /* GraphQL */ `
  mutation UpdateMBTransactionPay(
    $input: UpdateMBTransactionPayInput!
    $condition: ModelMBTransactionPayConditionInput
  ) {
    updateMBTransactionPay(input: $input, condition: $condition) {
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
export const deleteMBTransactionPay = /* GraphQL */ `
  mutation DeleteMBTransactionPay(
    $input: DeleteMBTransactionPayInput!
    $condition: ModelMBTransactionPayConditionInput
  ) {
    deleteMBTransactionPay(input: $input, condition: $condition) {
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
export const createMBTaxCountry = /* GraphQL */ `
  mutation CreateMBTaxCountry(
    $input: CreateMBTaxCountryInput!
    $condition: ModelMBTaxCountryConditionInput
  ) {
    createMBTaxCountry(input: $input, condition: $condition) {
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
export const updateMBTaxCountry = /* GraphQL */ `
  mutation UpdateMBTaxCountry(
    $input: UpdateMBTaxCountryInput!
    $condition: ModelMBTaxCountryConditionInput
  ) {
    updateMBTaxCountry(input: $input, condition: $condition) {
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
export const deleteMBTaxCountry = /* GraphQL */ `
  mutation DeleteMBTaxCountry(
    $input: DeleteMBTaxCountryInput!
    $condition: ModelMBTaxCountryConditionInput
  ) {
    deleteMBTaxCountry(input: $input, condition: $condition) {
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
export const createMBChargeCountry = /* GraphQL */ `
  mutation CreateMBChargeCountry(
    $input: CreateMBChargeCountryInput!
    $condition: ModelMBChargeCountryConditionInput
  ) {
    createMBChargeCountry(input: $input, condition: $condition) {
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
export const updateMBChargeCountry = /* GraphQL */ `
  mutation UpdateMBChargeCountry(
    $input: UpdateMBChargeCountryInput!
    $condition: ModelMBChargeCountryConditionInput
  ) {
    updateMBChargeCountry(input: $input, condition: $condition) {
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
export const deleteMBChargeCountry = /* GraphQL */ `
  mutation DeleteMBChargeCountry(
    $input: DeleteMBChargeCountryInput!
    $condition: ModelMBChargeCountryConditionInput
  ) {
    deleteMBChargeCountry(input: $input, condition: $condition) {
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
export const createMBDownloadBlink = /* GraphQL */ `
  mutation CreateMBDownloadBlink(
    $input: CreateMBDownloadBlinkInput!
    $condition: ModelMBDownloadBlinkConditionInput
  ) {
    createMBDownloadBlink(input: $input, condition: $condition) {
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
export const updateMBDownloadBlink = /* GraphQL */ `
  mutation UpdateMBDownloadBlink(
    $input: UpdateMBDownloadBlinkInput!
    $condition: ModelMBDownloadBlinkConditionInput
  ) {
    updateMBDownloadBlink(input: $input, condition: $condition) {
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
export const deleteMBDownloadBlink = /* GraphQL */ `
  mutation DeleteMBDownloadBlink(
    $input: DeleteMBDownloadBlinkInput!
    $condition: ModelMBDownloadBlinkConditionInput
  ) {
    deleteMBDownloadBlink(input: $input, condition: $condition) {
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
export const createMBNotification = /* GraphQL */ `
  mutation CreateMBNotification(
    $input: CreateMBNotificationInput!
    $condition: ModelMBNotificationConditionInput
  ) {
    createMBNotification(input: $input, condition: $condition) {
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
export const updateMBNotification = /* GraphQL */ `
  mutation UpdateMBNotification(
    $input: UpdateMBNotificationInput!
    $condition: ModelMBNotificationConditionInput
  ) {
    updateMBNotification(input: $input, condition: $condition) {
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
export const deleteMBNotification = /* GraphQL */ `
  mutation DeleteMBNotification(
    $input: DeleteMBNotificationInput!
    $condition: ModelMBNotificationConditionInput
  ) {
    deleteMBNotification(input: $input, condition: $condition) {
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
export const createFileUploadBank = /* GraphQL */ `
  mutation CreateFileUploadBank(
    $input: CreateFileUploadBankInput!
    $condition: ModelFileUploadBankConditionInput
  ) {
    createFileUploadBank(input: $input, condition: $condition) {
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
export const updateFileUploadBank = /* GraphQL */ `
  mutation UpdateFileUploadBank(
    $input: UpdateFileUploadBankInput!
    $condition: ModelFileUploadBankConditionInput
  ) {
    updateFileUploadBank(input: $input, condition: $condition) {
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
export const deleteFileUploadBank = /* GraphQL */ `
  mutation DeleteFileUploadBank(
    $input: DeleteFileUploadBankInput!
    $condition: ModelFileUploadBankConditionInput
  ) {
    deleteFileUploadBank(input: $input, condition: $condition) {
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
