export interface PlaidBalanceAccount {
    available?: string,
    current: number,
    iso_currency_code: string,
    limit?: number,
    unofficial_currency_code?: string
}

export interface PlaidAccount {
    account_id: string;
    balances: PlaidBalanceAccount;
    mask: string;
    name: string;
    official_name?: string;
    subtype?: string;
    type: string;
    institutionName: string;
    usedToPay?: boolean;
    address?: string;
    email?: string;
    phone?: string;
    publicToken?: string;
    accessToken?: string;
}
