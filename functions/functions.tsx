import * as Location from 'expo-location';
import {LocationAccuracy} from 'expo-location';
import {I18n} from "aws-amplify";
import {Platform} from "react-native";
import * as Notifications from 'expo-notifications';
import axios from "axios";
import {LocationGeocodedAddress} from "expo-location/src/Location.types";
import {MBTransaction, TxStatus, TxType} from "../src/API";

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const chardCode = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const pwdMatch = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
export const usrMatch = /^([a-z]+[0-9|a-z|.]*){4,16}$/;
export const codeMatch = /^(([\w]){8}|([\w]){9})$/;
export const emailMatch = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const paymentMethod = /^((?!ACCOUNT).)*$/;

export const Base64 = {
    btoa: (input = '') => {
        let str = input;
        let output = '';

        for (let block = 0, charCode, i = 0, map = chars;
             str.charAt(i | 0) || (map = '=', i % 1);
             output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

            charCode = str.charCodeAt(i += 3 / 4);

            if (charCode > 0xFF) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }

            block = block << 8 | charCode;
        }

        return output;
    },

    atob: (input = '') => {
        const str = input.replace(/=+$/, '');
        let output = '';

        if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (let bc = 0, bs = 0, buffer, i = 0;
             buffer = str.charAt(i++);

             ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
             bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }

        return output;
    }
};

export function navigateToRouteBlink(tx: MBTransaction, mbUser: any, navigation: any) {
    if (tx?.txType === TxType.SEND && tx?.txStatus === TxStatus.SEND && tx?.receiptID === mbUser?.id) {
        navigation.navigate('DownloadBlink');
    } else if (tx?.txType === TxType.REQUEST && tx?.txStatus === TxStatus.CONFIRM && tx?.receiptID === mbUser?.id) {
        navigation.navigate('DownloadBlink');
    } else if (tx?.shippingID === mbUser?.id &&
        tx?.txStatus === TxStatus.REQUEST &&
        tx?.txType === TxType.REQUEST && !tx?.isConfirm) {
        navigation.navigate('CompletedRequestBlink');
    } else if (tx?.txType === TxType.SEND && tx.txStatus === TxStatus.STANDBY && tx?.shippingID === mbUser?.id) {
        navigation.navigate('ConfirmStandBy', {
            txId: tx?.id
        });
    }
}

export function passwordValidator(text: string) {
    return !text.match(pwdMatch);
}

export function emailValidator(text: string) {
    return text.match(emailMatch);
}

export async function detectLocation(): Promise<any> {
    try {
        const askData = await Location.requestForegroundPermissionsAsync();
        if (askData.status === 'granted') {
            return await Location.getCurrentPositionAsync({
                accuracy: LocationAccuracy.Highest,
                mayShowUserSettingsDialog: true
            });
        } else {
            if (askData)
                return await detectLocation();
        }
    } catch (e) {
        alert(I18n.get(e.message));
        throw e;
    }
}

export async function detectAddress(location: any): Promise<LocationGeocodedAddress[] | undefined> {
    try {
        return await Location.reverseGeocodeAsync(location);
    } catch (e) {
        alert(I18n.get(e.message));
    }
}

export const generateCodeAlphaNumeric = (length: number = 12): string => {
    let result: string = '';
    const chardCodeLength = chardCode.length;
    let i: number;
    for (i = 0; i < length; i++) {
        result += chardCode.charAt(Math.floor(Math.random() * chardCodeLength));
    }
    return result;
}

export const getStringFullAddress = (address: any): any => {
    return `${address?.name ? `${address.name} ` : ''}${address?.street ? `${address.street} ` : ''}${address?.city ? `, ${address.city}` : ''}${address?.region ? `, ${address.region}` : ''}${address?.postalCode ? `, ${address.postalCode}` : ''}`;
}

export const getStringAddress = (address: any): string => {
    return `${address?.name ? `${address.name} ` : ''}${address?.street ? `${address.street}` : ''}${address?.district ? `${address.district}` : ''}`
}

export async function registerForPushNotificationsAsync() {
    let token;
    // if (Constants.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // } else {
    //     alert('Must use physical device for Push Notifications');
    // }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

export const nameOfImageFromUri = (uri: string): string | null => {
    const lastIndex: number = uri.lastIndexOf('/');
    return (lastIndex >= 0) ? uri.substr(lastIndex + 1) : null;
}

export const loadMoneyBlinksCountries = async (): Promise<any[]> => {
    try {
        return await axios.get('https://api.countrylayer.com/v2/all?access_key=dcc39e2a0471f6e7dda5c197b8fba501');
    } catch (e) {
        throw e;
    }
}

export const createPlaidToken = async (
    clientId: string,
    clientSKey: string,
    user: any,
    environment: string,
    country: string,
    language: string
) => {
    try {
        const data: any =  await fetch(`${environment}/link/token/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                "language": language || "es",
                "client_id": clientId,
                "secret": clientSKey,
                "user": {
                    "client_user_id": user.id
                },
                "client_name": 'MoneyBlinks Wallet',
                "products": ['transactions', 'auth'],
                "country_codes": ['US', 'CA'],
                "webhook": "https://moneyblinks.com",
                "account_filters": {
                    "depository": {
                        "account_subtypes": ["checking"]
                    }
                }
            })
        }).then(response => response.json());
        if (data.hasOwnProperty('error_code')) {
            throw Error(data?.error_message);
        }
        return data;
    } catch (e) {
        throw e;
    }
}

export const getPlaidAccessToken = async (
    publicToken: string,
    clientId: string,
    privateSKey: string,
    environment: string
): Promise<any> => {
    try {
        const data: any =  await fetch(`${environment}/item/public_token/exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                secret: privateSKey,
                public_token: publicToken
            })
        }).then(response => response.json())
        if (data.hasOwnProperty('error_code')) {
            throw Error(data?.error_message);
        }
        return data;
    } catch (e) {
        throw e;
    }
}

export const sendNotification = async (
    deviceToken: string,
    title: string,
    body: string,
    data: any,
    badge?: any,
    accessToken?: any
) => {
    try {
        let bodyData: any = {
            title,
            body,
            data,
            to: deviceToken,
        };
        if (badge) {
            bodyData['badge'] = badge;
        }

        return await axios.post('https://exp.host/--/api/v2/push/send', bodyData, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken ? accessToken : 'u2uzgs1E-js8B4N7FjEg3FbeY7mQMyXZIoQViufs'}`
            }
        });
    } catch (e) {
        console.error(e);
    }
}

export const getInfoPlaidAccounts = async (
    accessToken: string,
    environment: string,
    clientId: string,
    privateSKey: string
): Promise<any> => {
    try {
        const data = await fetch(`${environment}/accounts/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                secret: privateSKey,
                access_token: accessToken
            })
        }).then(response => response.json());
        if (data.hasOwnProperty('error_code')) {
            throw Error(data?.error_message);
        }
        return data;
    } catch (e) {
        throw e;
    }
}

export const getBalanceAccountPlaid = async (
    environment: string,
    clientId: string,
    secretKey: string,
    accessToken: string,
    accountId: string
) => {
    try {
        const data = await axios.post(`${environment}/accounts/balance/get`, {
            client_id: clientId,
            secret: secretKey,
            access_token: accessToken,
            options: {
                "account_ids": [accountId]
            }
        });
    } catch (e) {
        throw e;
    }
}

export const statesOfUSA = (): any[] => [
    {label: "Alabama", value: "AL"},
    {label: "Alaska", value: "AK"},
    {label: "Arizona", value: "AZ"},
    {label: "Arkansas", value: "AR"},
    {label: "California", value: "CA"},
    {label: "Colorado", value: "CO"},
    {label: "Connecticut", value: "CT"},
    {label: "Delaware", value: "DE"},
    {label: "District of Columbia", value: "DC"},
    {label: "Florida", value: "FL"},
    {label: "Georgia", value: "GA"},
    {label: "Hawaii", value: "HI"},
    {label: "Idaho", value: "ID"},
    {label: "Illinois", value: "IL"},
    {label: "Indiana", value: "IN"},
    {label: "Iowa", value: "IA"},
    {label: "Kansa", value: "KS"},
    {label: "Kentucky", value: "KY"},
    {label: "Lousiana", value: "LA"},
    {label: "Maine", value: "ME"},
    {label: "Maryland", value: "MD"},
    {label: "Massachusetts", value: "MA"},
    {label: "Michigan", value: "MI"},
    {label: "Minnesota", value: "MN"},
    {label: "Mississippi", value: "MS"},
    {label: "Missouri", value: "MO"},
    {label: "Montana", value: "MT"},
    {label: "Nebraska", value: "NE"},
    {label: "Nevada", value: "NV"},
    {label: "New Hampshire", value: "NH"},
    {label: "New Jersey", value: "NJ"},
    {label: "New Mexico", value: "NM"},
    {label: "New York", value: "NY"},
    {label: "North Carolina", value: "NC"},
    {label: "North Dakota", value: "ND"},
    {label: "Ohio", value: "OH"},
    {label: "Oklahoma", value: "OK"},
    {label: "Oregon", value: "OR"},
    {label: "Pennsylvania", value: "PA"},
    {label: "Rhode Island", value: "RI"},
    {label: "South Carolina", value: "SC"},
    {label: "South Dakota", value: "SD"},
    {label: "Tennessee", value: "TN"},
    {label: "Texas", value: "TX"},
    {label: "Utah", value: "UT"},
    {label: "Vermont", value: "VT"},
    {label: "Virginia", value: "VA"},
    {label: "Washington", value: "WA"},
    {label: "West Virginia", value: "WV"},
    {label: "Wisconsin", value: "WI"},
    {label: "Wyoming", value: "WY"}
];

export const ecuBanks = [
    {
        "code": "0010",
        "label": "PICHINCHA",
        "active": true
    },
    {
        "code": "0017",
        "label": "GUAYAQUIL",
        "active": true
    },
    {
        "code": "0024",
        "label": "CITIBANK",
        "active": true
    },
    {
        "code": "0025",
        "label": "MACHALA",
        "active": true
    },
    {
        "code": "0029",
        "label": "LOJA",
        "active": true
    },
    {
        "code": "0030",
        "label": "PACIFICO",
        "active": true
    },
    {
        "code": "0032",
        "label": "INTERNACIONAL",
        "active": true
    },
    {
        "code": "0034",
        "label": "AMAZONAS",
        "active": true
    },
    {
        "code": "0035",
        "label": "AUSTRO",
        "active": true
    },
    {
        "code": "0036",
        "label": "PRODUBANCO",
        "active": true
    },
    {
        "code": "0037",
        "label": "BOLIVARIANO",
        "active": true
    },
    {
        "code": "0039",
        "label": "COMERCIAL DE MANABI",
        "active": true
    },
    {
        "code": "0042",
        "label": "RUMINAHUI",
        "active": true
    },
    {
        "code": "0043",
        "label": "DEL LITORAL",
        "active": true
    },
    {
        "code": "0059",
        "label": "SOLIDARIO",
        "active": true
    },
    {
        "code": "0060",
        "label": "BANCO PROCREDIT",
        "active": true
    },
    {
        "code": "0061",
        "label": "BANCO CAPITAL",
        "active": true
    },
    {
        "code": "0062",
        "label": "BANCO PARA LA ASISTENCIA COMUNITARIA FINCA S.A.",
        "active": true
    },
    {
        "code": "0064",
        "label": "BANCO COOPNACIONAL SA",
        "active": true
    },
    {
        "code": "0065",
        "label": "BANCO DESARROLLO DE LOS PUEBLOS S.A.",
        "active": true
    },
    {
        "code": "0066",
        "label": "BANECUADOR B.P.",
        "active": true
    },
    {
        "code": "0085",
        "label": "MUTUALISTA IMBABURA",
        "active": true
    },
    {
        "code": "0086",
        "label": "MUTUALISTA PICHINCHA",
        "active": true
    },
    {
        "code": "0087",
        "label": "MUTUALISTA AMBATO",
        "active": true
    },
    {
        "code": "0088",
        "label": "MUTUALISTA AZUAY",
        "active": true
    },
    {
        "code": "0100",
        "label": "COOP. AHORRO Y CREDITO 15 DE ABRIL LTDA",
        "active": true
    },
    {
        "code": "0102",
        "label": "COOP. AHORRO Y CREDITO CARIAMANGA LTDA.",
        "active": true
    },
    {
        "code": "0103",
        "label": "COOP. AHORRO Y CREDITO PUELLARO LTDA",
        "active": true
    },
    {
        "code": "0105",
        "label": "COOP. DE A. Y C. 16 DE JUNIO",
        "active": true
    },
    {
        "code": "0107",
        "label": "COOP. DE A. Y C. 23 DE MAYO LTDA.",
        "active": true
    },
    {
        "code": "0108",
        "label": "COOP. DE A. Y C. MAQUITA CUSHUNCHIC LTDA.",
        "active": true
    },
    {
        "code": "0109",
        "label": "COOP. DE AHORRO Y CREDITO SAN FRANCISCO DE ASIS LT",
        "active": true
    },
    {
        "code": "0124",
        "label": "COOP. AHORRO Y CREDITO MANANTIAL DE ORO LTDA.",
        "active": true
    },
    {
        "code": "0125",
        "label": "COOP. AHORRO Y CREDITO JUAN DE SALINAS LTDA.",
        "active": true
    },
    {
        "code": "0126",
        "label": "COOP. AHORRO Y CREDITO NUEVA JERUSALEN",
        "active": true
    },
    {
        "code": "0129",
        "label": "COOP. AHORRO Y CREDITO AGRARIA MUSHUK KAWSAY LTDA.",
        "active": true
    },
    {
        "code": "0130",
        "label": "COOP. AHORRO Y CREDITO TENA LTDA.",
        "active": true
    },
    {
        "code": "0131",
        "label": "COOP. AHORRO Y CREDITO DE LA PEQUENA EMPRESA GUALA",
        "active": true
    },
    {
        "code": "0132",
        "label": "COOP. AHORRO Y CREDITO MI TIERRA",
        "active": true
    },
    {
        "code": "0133",
        "label": "COOP. DE AHORRO Y CREDITO DE LA PEQ. EMP. CACPE YA",
        "active": true
    },
    {
        "code": "0134",
        "label": "COOP. AHORRO Y CREDITO FUNDESARROLLO",
        "active": true
    },
    {
        "code": "0135",
        "label": "COOP. A Y C DE LA PEQ. EMP. CACPE ZAMORA LTDA.",
        "active": true
    },
    {
        "code": "0139",
        "label": "COOP. AHO Y CRED ALIANZA MINAS LTDA.",
        "active": true
    },
    {
        "code": "0140",
        "label": "ECUATORIANO DE LA VIVIENDA",
        "active": true
    },
    {
        "code": "0143",
        "label": "COOPERATIVA 9 DE OCTUBRE LTDA",
        "active": true
    },
    {
        "code": "0144",
        "label": "COOPERATIVA CACPE BIBLIAN LTDA",
        "active": true
    },
    {
        "code": "0155",
        "label": "COOP. DE AH Y CR ONCE DE JUNIO",
        "active": true
    },
    {
        "code": "0161",
        "label": "COOP DE AH Y CR DE SERV PUBLIC MINISTERIO EDUC Y C",
        "active": true
    },
    {
        "code": "0168",
        "label": "COOP AH Y CR POLICIA NACIONAL",
        "active": true
    },
    {
        "code": "0183",
        "label": "BANCO D MIRO SA",
        "active": true
    },
    {
        "code": "0185",
        "label": "Coop Ah y Cr de la Pequena Empresa de Loja CACPE L",
        "active": true
    },
    {
        "code": "0187",
        "label": "COOP. DE AHORRO Y CREDITO SR. DE GIRON",
        "active": true
    },
    {
        "code": "0204",
        "label": "Coop Ah y Credito Ambato Ltda",
        "active": true
    },
    {
        "code": "0205",
        "label": "COOPE AHO Y CRED PADRE JULIAN LORENTE LTDA",
        "active": true
    },
    {
        "code": "0214",
        "label": "COOP AHO Y CRED EDUCADORES DE CHIMBORAZO",
        "active": true
    },
    {
        "code": "0221",
        "label": "COOP DE AHO Y CRED SAN MIGUEL DE LOS BANCOS",
        "active": true
    },
    {
        "code": "0222",
        "label": "COOP AH Y CR SAN ANTONIO LTDA.",
        "active": true
    },
    {
        "code": "0229",
        "label": "COOP AH Y CRJUAN PIO MORA LTDA",
        "active": true
    },
    {
        "code": "0230",
        "label": "COOP AH Y CR EDUCADORES DE PASTAZA LTDA",
        "active": true
    },
    {
        "code": "0233",
        "label": "COOPE.CAMARA DE COMERCIO DE AMBATO",
        "active": true
    },
    {
        "code": "0257",
        "label": "COOP AH Y CR COCA LTDA",
        "active": true
    },
    {
        "code": "0263",
        "label": "COOP. DE AHORRO Y CREDITO MUSHUC RUNA LTDA.",
        "active": true
    },
    {
        "code": "0270",
        "label": "COOP AH Y CR CREDIAMIGO",
        "active": true
    },
    {
        "code": "0275",
        "label": "COOP. DE AHORRO Y CREDITO NUEVA HUANCAVILCA LTDA.",
        "active": true
    },
    {
        "code": "0291",
        "label": "COOP. DE AH Y CR LA INMACULADA DE SAN PLACIDO LTDA",
        "active": true
    },
    {
        "code": "0293",
        "label": "COOP. DE A Y C. LUZ DEL VALLE",
        "active": true
    },
    {
        "code": "0295",
        "label": "COOPERATIVA DE AHORRO Y CREDITO LA BENEFICA LTDA",
        "active": true
    },
    {
        "code": "0296",
        "label": "COOPERATIVA DE AHORRO Y CREDITO FERNANDO DAQUILEMA",
        "active": true
    },
    {
        "code": "0299",
        "label": "COOP  DE AHORRO Y CREDITO LA MERCED LTDA",
        "active": true
    },
    {
        "code": "0300",
        "label": "COOP. DE AHORRO Y CREDITO PEDRO MONCAYO LTDA.",
        "active": true
    },
    {
        "code": "0301",
        "label": "COOP. DE AHORRO Y CREDITO LOS ANDES LATINOS LTDA.",
        "active": true
    },
    {
        "code": "0302",
        "label": "COOP. DE A Y C GUAMOTE LTDA",
        "active": true
    },
    {
        "code": "0303",
        "label": "COOP. DE A. Y C. CREDISOCIO",
        "active": true
    },
    {
        "code": "0306",
        "label": "COOP. DE A. Y C. CAMARA DE COMERCIO SANTO DOMINGO",
        "active": true
    },
    {
        "code": "0308",
        "label": "COOP DE A Y CR CORPORACION CENTRO LTDA",
        "active": true
    },
    {
        "code": "0311",
        "label": "COOP AHORRO Y CREDITO SAN GABRIEL LTDA",
        "active": true
    },
    {
        "code": "0312",
        "label": "COOP AHORRO Y CREDI MUJERES UNIDAS TANTANAKUSHKA W",
        "active": true
    },
    {
        "code": "0313",
        "label": "COOPERATIVA DE AHORRO Y CREDITO ARTESANOS LTDA",
        "active": true
    },
    {
        "code": "0314",
        "label": "COOPERATIVA DE AHORRO Y CREDITO SANTA ANITA LTDA",
        "active": true
    },
    {
        "code": "0315",
        "label": "COOP. DE A. Y C. 13 DE ABRIL LTDA",
        "active": true
    },
    {
        "code": "0316",
        "label": "COOP. DE AHORRO Y CREDITO PILAHUIN TIO LTDA.",
        "active": true
    },
    {
        "code": "0318",
        "label": "COOP. DE A. Y C. COOPAC AUSTRO LTDA -MIESS",
        "active": true
    },
    {
        "code": "0319",
        "label": "COOPERATIVA DE AHORRO Y CREDITO CREA LTDA -MIES",
        "active": true
    },
    {
        "code": "0320",
        "label": "COOP. DE A. Y C. CHIBULEO LTDA.",
        "active": true
    },
    {
        "code": "0323",
        "label": "COOP. DE AHORRO Y CREDITO 4 DE OCTUBRE LTDA.",
        "active": true
    },
    {
        "code": "0324",
        "label": "COOP AHORRO Y CREDITO SAN ISIDRO LTDA",
        "active": true
    },
    {
        "code": "0327",
        "label": "COOP. AHORRO Y CREDITO SEMILLA DEL PROGRESO LTDA.",
        "active": true
    },
    {
        "code": "0328",
        "label": "COOP. DE AHORRO Y CREDITO HUAICANA LTDA",
        "active": true
    },
    {
        "code": "0331",
        "label": "COOP. DE A. Y C. ABDON CALDERON LTDA.",
        "active": true
    },
    {
        "code": "0338",
        "label": "COOPERATIVA DE AHORRO Y CREDITO PUCARA LTDA",
        "active": true
    },
    {
        "code": "0341",
        "label": "COOPERATIVA DE AHORRO Y CREDITO MULTIEMPRESARIAL L",
        "active": true
    },
    {
        "code": "0342",
        "label": "COOP DE A Y C SAN JUAN DE COTOGCHOA",
        "active": true
    },
    {
        "code": "0353",
        "label": "COOPERATIVA DE AHORRO Y CREDITO MINGA LTDA",
        "active": true
    },
    {
        "code": "0354",
        "label": "COOP DE AH Y CR ERCO LTDA.",
        "active": true
    },
    {
        "code": "0355",
        "label": "COOP DE AHORRO Y CREDITO SANTA ISABEL LTDA",
        "active": true
    },
    {
        "code": "0359",
        "label": "COOP. DE A. Y C. LUCHA CAMPESINA LTDA.",
        "active": true
    },
    {
        "code": "0368",
        "label": "COOP AH Y CR ANDINA LTDA",
        "active": true
    },
    {
        "code": "0372",
        "label": "COOP DE AH Y CR NUEVA ESPERANZA",
        "active": true
    },
    {
        "code": "0373",
        "label": "COOP. DE AH Y CR FORTUNA - MIES",
        "active": true
    },
    {
        "code": "0395",
        "label": "COOP DE AHORRO Y CREDITO PROVIDA",
        "active": true
    },
    {
        "code": "0397",
        "label": "COOPERATIVA DE AHORRO Y CREDITO LAS LAGUNAS-MIESS",
        "active": true
    },
    {
        "code": "0404",
        "label": "COOP DE A Y C FUTURO LAMANENSE",
        "active": true
    },
    {
        "code": "0405",
        "label": "COOPERATIVA DE AHORO Y CREDITO VISION DE LOS ANDES",
        "active": true
    },
    {
        "code": "0406",
        "label": "COOP A Y C UNION EL EJIDO",
        "active": true
    },
    {
        "code": "0407",
        "label": "COOP A Y C VILCABAMBA CACVIL",
        "active": true
    },
    {
        "code": "0408",
        "label": "COOP A Y C CADECOG GONZANAMA",
        "active": true
    },
    {
        "code": "0426",
        "label": "COOP. DE AHORRO Y CREDITO SAN MIGUEL DE PALLATANGA",
        "active": true
    },
    {
        "code": "0432",
        "label": "COOP A Y C ESPERANZA Y PROGRESO DEL VALLE",
        "active": true
    },
    {
        "code": "0440",
        "label": "COOP. DE AH Y CR 1 DE JULIO",
        "active": true
    },
    {
        "code": "0446",
        "label": "COOP.DE AHORRO Y CREDITO MICROEMPRESARIAL SUCRE",
        "active": true
    },
    {
        "code": "0457",
        "label": "COOP. DE AH Y CR TEXTIL 14 DE MARZO",
        "active": true
    },
    {
        "code": "0467",
        "label": "COOP. DE AH Y CR INDIGENA SAC LTDA",
        "active": true
    },
    {
        "code": "0470",
        "label": "COOP. DE AH Y CR FOCLA",
        "active": true
    },
    {
        "code": "0479",
        "label": "COOP. DE AH Y CR SANTA LUCIA LTDA",
        "active": true
    },
    {
        "code": "0485",
        "label": "COOP. DE AH Y CR MASCOOP",
        "active": true
    },
    {
        "code": "0486",
        "label": "COOP. DE AH Y CR CACPE CELICA",
        "active": true
    },
    {
        "code": "0487",
        "label": "COOP. DE AH Y CR CACEC LTDA. COTOPAXI",
        "active": true
    },
    {
        "code": "0488",
        "label": "COOP. DE AH Y CR MAGISTERIO MANABITA LIMITADA",
        "active": true
    },
    {
        "code": "0489",
        "label": "COOP. DE AH Y CR ALFONSO JARAMILLO C.C.C.",
        "active": true
    },
    {
        "code": "0498",
        "label": "COOP. DE AH Y CR PARA LA VIVIENDA ORDEN Y SEGURIDA",
        "active": true
    },
    {
        "code": "0506",
        "label": "COOP. DE AH Y CR VIRGEN DEL CISNE",
        "active": true
    },
    {
        "code": "0508",
        "label": "COOP. DE AH Y CR SANTA MARIA DE LA MANGA DEL CURA",
        "active": true
    },
    {
        "code": "0509",
        "label": "COOP. DE AH Y CR 16 DE JULIO LTDA",
        "active": true
    },
    {
        "code": "0510",
        "label": "COOP. DE AH Y CR METROPOLIS LTDA.",
        "active": true
    },
    {
        "code": "0511",
        "label": "COOP. DE AH. Y CR. SAN MARTIN DE TISALEO LTDA.",
        "active": true
    },
    {
        "code": "0512",
        "label": "COOP. DE AH Y CR EDUCADORES TULCAN LTDA",
        "active": true
    },
    {
        "code": "0513",
        "label": "COOP. DE AH Y CR EDUCADORES DE ZAMORA CHINCHIPE",
        "active": true
    },
    {
        "code": "0520",
        "label": "COOP. DE AH Y CR SERVIDORES MUNICIPALES DE CUENCA",
        "active": true
    },
    {
        "code": "0522",
        "label": "COOP. DE AH Y CR EDUCADORES DE LOJA",
        "active": true
    },
    {
        "code": "0525",
        "label": "COOP. DE AH Y CR PUERTO FRANCISCO DE ORELLANA",
        "active": true
    },
    {
        "code": "0526",
        "label": "COOP. DE AH Y CR CAMARA DE COMERCIO JOYA DE LOS SA",
        "active": true
    },
    {
        "code": "0529",
        "label": "COOP. DE AH Y CR PADRE VICENTE PONCE RUBIO",
        "active": true
    },
    {
        "code": "0533",
        "label": "COOP. DE AH Y CR ESPERANZA DEL FUTURO LTDA",
        "active": true
    },
    {
        "code": "0534",
        "label": "COOP. AH Y CR SUMAK KAWSAY",
        "active": true
    },
    {
        "code": "0535",
        "label": "COOP. AH Y CR VISIONFUND ECUADOR S. A.",
        "active": true
    },
    {
        "code": "0537",
        "label": "COOP. AH Y CR SAN ANTONIO LTDA. - IMBABURA (MIES)",
        "active": true
    },
    {
        "code": "0538",
        "label": "COOP DE AH Y CR ECUACREDITOS LTDA",
        "active": true
    },
    {
        "code": "0539",
        "label": "BANCO DEL INSTITUTO ECUATORIANO DE SEGURIDAD SOCIA",
        "active": true
    },
    {
        "code": "0550",
        "label": "COOP. DE AH Y CR SAN JOSE S.J.",
        "active": true
    },
    {
        "code": "0552",
        "label": "COOP. DE AH Y CR LA FLORESTA LTDA.",
        "active": true
    },
    {
        "code": "0554",
        "label": "COOP. DE AH Y CR SOL DE LOS ANDES LTDA.",
        "active": true
    },
    {
        "code": "0555",
        "label": "COOP. DE AH Y CR SIERRA CENTRO",
        "active": true
    },
    {
        "code": "0564",
        "label": "COOP. DE AH Y CR  ACCION IMBABURAPAK LTDA.",
        "active": true
    },
    {
        "code": "0568",
        "label": "COOP. DE AH Y CR ACCION TUNGURAHUA LTDA",
        "active": true
    },
    {
        "code": "1015",
        "label": "DINERS/VISA INTERDIN/DISCOVER - Transferencias EnL",
        "active": true
    },
    {
        "code": "9963",
        "label": "CORPORACION FINANCIERA",
        "active": true
    },
    {
        "code": "9964",
        "label": "FINANCIERA FINANCOOP",
        "active": true
    },
    {
        "code": "9965",
        "label": "COOP. AHORRO Y CREDITO COOPROGRESO",
        "active": true
    },
    {
        "code": "9966",
        "label": "DELBANK S.A.",
        "active": true
    },
    {
        "code": "9967",
        "label": "DINERS CLUB",
        "active": true
    },
    {
        "code": "9969",
        "label": "COOP. TULCAN",
        "active": true
    },
    {
        "code": "9970",
        "label": "COOP. PABLO MUNOZ VEGA",
        "active": true
    },
    {
        "code": "9971",
        "label": "COOP. CALCETA LTDA.",
        "active": true
    },
    {
        "code": "9972",
        "label": "COOP DE AH Y CR CONSTRUCCION COMERCIO Y PRODUCCION",
        "active": true
    },
    {
        "code": "9974",
        "label": "COOP. JUVENTUD ECUATORIANA PROGRESISTA LTDA.",
        "active": true
    },
    {
        "code": "9975",
        "label": "COOP. AHO Y CREDITO 23 DE JULIO",
        "active": true
    },
    {
        "code": "9976",
        "label": "COOP. AHO Y CREDITO SANTA ANA",
        "active": true
    },
    {
        "code": "9977",
        "label": "COOP. ALIANZA DEL VALLE LTDA.",
        "active": true
    },
    {
        "code": "9979",
        "label": "COOP. RIOBAMBA",
        "active": true
    },
    {
        "code": "9980",
        "label": "COOP. COMERCIO LTDA PORTOVIEJO",
        "active": true
    },
    {
        "code": "9981",
        "label": "COOP. CHONE LTDA.",
        "active": true
    },
    {
        "code": "9982",
        "label": "COOP. CACPECO",
        "active": true
    },
    {
        "code": "9983",
        "label": "COOP. ATUNTAQUI",
        "active": true
    },
    {
        "code": "9984",
        "label": "COOP. GUARANDA",
        "active": true
    },
    {
        "code": "9985",
        "label": "COOP AHO Y CREDITO SANTA ROSA",
        "active": true
    },
    {
        "code": "9986",
        "label": "COOP. AHO Y CREDITO EL SAGRARIO",
        "active": true
    },
    {
        "code": "9987",
        "label": "COOP. OSCUS",
        "active": true
    },
    {
        "code": "9988",
        "label": "COOP. LA DOLOROSA",
        "active": true
    },
    {
        "code": "9989",
        "label": "COOP AHO Y CREDITO  MANUEL GODOY",
        "active": true
    },
    {
        "code": "9991",
        "label": "COOP AHO Y CREDITO SAN JOSE",
        "active": true
    },
    {
        "code": "9992",
        "label": "COOP. AHO Y CREDITO SAN FRANCISCO",
        "active": true
    },
    {
        "code": "9993",
        "label": "COOP. AHO Y CREDITO JARDIN AZUAYO",
        "active": true
    },
    {
        "code": "9994",
        "label": "COOP. COTOCOLLAO",
        "active": true
    },
    {
        "code": "9995",
        "label": "COOP. 29 DE OCTUBRE",
        "active": true
    },
    {
        "code": "9997",
        "label": "COOP. PEQ. EMPRESA DE PASTAZA",
        "active": true
    },
    {
        "code": "9998",
        "label": "COOP. ANDALUCIA",
        "active": true
    },
    {
        "code": "9999",
        "label": "COOP. PREVISION AHORRO Y DESARROLLO",
        "active": true
    }
];
