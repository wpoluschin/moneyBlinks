import 'react-native-gesture-handler';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import * as Localization from "expo-localization";

import {Provider as PaperProvider} from 'react-native-paper';

import Amplify, {I18n} from 'aws-amplify';

import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
import MBStates from './contexts/MoneyBlinks/MBStates';
import config from './src/aws-exports';
import {en_US} from './assets/translates/en';
import {es_ES} from './assets/translates/es';
import {themeDefault} from "./constants/Colors";

Amplify.configure(config);

I18n.putVocabulariesForLanguage('en-US', en_US);
I18n.putVocabulariesForLanguage('es-US', es_ES);
I18n.putVocabulariesForLanguage('es-ES', es_ES);
I18n.putVocabulariesForLanguage('es-EC', es_ES);
I18n.putVocabulariesForLanguage('es-CU', es_ES);
I18n.putVocabulariesForLanguage('es', es_ES);
I18n.putVocabulariesForLanguage('en', en_US);

const {locale} = Localization;
if (locale) {
    if (['es-ES', 'es-EC', 'es-CU', 'es-US', 'en-US'].includes(locale)) {
        I18n.setLanguage(locale);
    } else if (['es', 'en'].includes(locale.substr(0, 2))) {
        I18n.setLanguage(locale.substr(0, 2));
    } else {
        I18n.setLanguage('en');
    }
} else {
    I18n.setLanguage('en');
}

export default function App() {
    const isLoadingComplete = useCachedResources();

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={themeDefault}>
                    <MBStates>
                        <Navigation/>
                    </MBStates>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }
}
