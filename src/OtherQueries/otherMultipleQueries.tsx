export const loadPaymentsMethodsByUserAndCoutries = `
  query ListMBPaymentMethodCountrys(
    $filter: ModelMBPaymentMethodCountryFilterInput
    $filterMyPayments: ModelMBMyPaymentMethodFilterInput
  ) {
    listMBPaymentMethodCountrys(
      filter: $filter
    ) {
      items {
        id
        paymentMethodID
        costCenterID
        paymentMethod {
          id
          name
          code
          translate
        }
        costCenter {
          id
          type
          name
          translate
        }
        settings
        isActive
        paymentTypeCode
        alpha2Code
        alpha3Code
        isReceipt
        isShipping
        users(filter: $filterMyPayments) {
          items {
            id
            accountId
            value
            label
            settings
            payType
            description
          }
        }
      }
    }
  }
`;

export const listChargesTaxesByCountry = /* GraphQL */ `
  query ListMBCountrys(
    $filter: ModelMBCountryFilterInput
    $filterTax: ModelMBTaxCountryFilterInput
    $filterCharge: ModelMBChargeCountryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listMBCountrys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        taxes(filter: $filterTax, sortDirection: $sortDirection) {
          items {
              id
              taxCode
              translate
              currency
              total
              settings
          }
          nextToken
        }
        charges(filter: $filterCharge, sortDirection: $sortDirection) {
          items {
              id
              chargeCode
              translate
              currency
              total
              settings
          } 
          nextToken
        }
      }
      nextToken
    }
  }
`;

export const listAllMyFrequentsShipments = /* GraphQL */ `
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
        invited {
           avatarUrl
           cognitoUserId
           deviceToken
           email
           fullName
           id
           locale
           nickname
           phoneNumber
           currency
        }
        isFavorite
        myShipments
        code
      }
      nextToken
    }
  }
`;
export const listAllMyFrequentsReceipts = /* GraphQL */ `
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
        invited {
           avatarUrl
           cognitoUserId
           deviceToken
           email
           fullName
           id
           locale
           nickname
           phoneNumber
           currency
        }
        isFavorite
        myReceipts
        code
      }
      nextToken
    }
  }
`;

export const listAllHistorical = /* GraphQL */ `
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
        amount
        currency
        amountDeposit
        currencyDeposit
        message
        requestMessage
        txType
        txStatus
        shippingID
        isReceipt
        shipping {
          id
          type
          cognitoUserId
          nickname
          fullName
          email
          locale
          phoneNumber
          avatarUrl
          oldAvatarUrl
          deviceToken
        }
        receiptID
        receipt {
          id
          type
          cognitoUserId
          nickname
          fullName
          email
          locale
          phoneNumber
          avatarUrl
          oldAvatarUrl
          deviceToken
        }
        codeID
        moneyBlinksCode {
          id
          code
          codeType
          isUsed
        }
        isConfirm
      }
      nextToken
    }
  }
`;
