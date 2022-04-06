import {
  DefaultTheme as RNPDefaultTheme,
  DarkTheme as RNPDarkTheme
} from 'react-native-paper';

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: 'transparent',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFF',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};


export const themeDefault: any = {
  ...RNPDefaultTheme,
  ...{
    fonts: {
      regular: {
        ...RNPDefaultTheme.fonts.regular,
        fontFamily: 'Roboto',
      },
      medium: {
        ...RNPDefaultTheme.fonts.medium,
        fontFamily: 'Roboto-Medium'
      },
      light: {
        ...RNPDefaultTheme.fonts.light,
        fontFamily: 'Roboto-Light'
      },
      thin: {
        ...RNPDefaultTheme.fonts.thin,
        fontFamily: 'Roboto-Thin'
      }
    },
    colors: {
      ...RNPDefaultTheme.colors,
      ...{
        primary: '#0771B8',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        accent: '#DA2164',
        error: '#E33F3B',
        text: '#000000',
        onSurface: '#4EA750',
        info: '#4EA750',
        disabled: '#97A19A',
        placeholder: '#383938',
        backdrop: 'transparent',
        notification: '#4EA750',
        btnColor: '#52C1E0',
        header: '#52C1E0',
        btnDisabled: '#EEEEEE',
        warn: '#E98A3C',
        darkBlue: '#'
      }
    }
  }
}

export const themeDark: any = {
  ...RNPDarkTheme,
  ...{
    fonts: {
      regular: {
        ...RNPDarkTheme.fonts.regular,
        fontFamily: 'Roboto',
      },
      medium: {
        ...RNPDarkTheme.fonts.medium,
        fontFamily: 'Roboto-Medium'
      },
      light: {
        ...RNPDarkTheme.fonts.light,
        fontFamily: 'Roboto-Light'
      },
      thin: {
        ...RNPDarkTheme.fonts.thin,
        fontFamily: 'Roboto-Thin'
      }
    },
    colors: {
      ...RNPDarkTheme.colors,
      ...{
        primary: '#0771B8',
        background: '#EEEEEE',
        surface: '#FFFFFF',
        accent: '#DA2164',
        error: '#E33F3B',
        text: '#000000',
        onSurface: '#4EA750',
        disabled: '#97A19A',
        placeholder: '#f1ebeb',
        backdrop: '#575656',
        notification: '#4EA750',
      }
    }
  }
}
