import React, {useState, Fragment, useContext} from "react";
import {Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, HelperText, Text, TextInput} from "react-native-paper";
import {Auth, I18n} from "aws-amplify";
import {Formik} from "formik";
import * as Yup from "yup";
import Constants from "expo-constants";

import {mbCommonStyles} from "../../constants/styles";
import {usrMatch} from "../../functions/functions";
import {MBDividerText} from "../../components/MBCommonsComponets";
import MBContext from "../../contexts/MoneyBlinks/MBContext";

export default function ForgotPassword({ route, navigation }: any) {
    const [error, setError] = useState(null);
    const [username] = useState(route?.params?.username || '');

    const { handleLoading }: any = useContext(MBContext);

    async function onRecoveryPassword(values: any) {
        handleLoading(true);
        try {
            await Auth.forgotPassword(values?.username);

            navigation.navigate('RecoveryPassword', {
                username: values?.username
            });
        } catch (e) {
            console.log(e);
            setError(e.message || e.errors[0].message || e);
        } finally {
            handleLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
                <Image source={require('../../assets/images/logo-mb.png')}
                       style={{
                           resizeMode: "contain",
                           width: '100%',
                           marginTop: -200,
                           marginBottom: -200
                       }}/>
                {
                    error && (
                        <Text style={{
                            width: '100%',
                            color: '#E76060',
                            fontWeight: "bold",
                            fontSize: 18,
                            marginVertical: 20
                        }}>
                            {I18n.get(error)}
                        </Text>
                    )
                }
                <Formik
                    onSubmit={onRecoveryPassword}
                    validationSchema={Yup.object().shape({
                        username: Yup.string().nullable()
                            .matches(usrMatch, 'USERNAME_INVALID')
                            .min(4, 'USERNAME_INVALID')
                            .required('USERNAME_IS_REQUIRED'),
                    })}
                    initialValues={{
                        username
                    }}>
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          errors,
                          touched,
                          values
                      }) => (
                        <Fragment>
                            <View style={{marginVertical: 10}}>
                                <TextInput mode='outlined'
                                           label={I18n.get('USERNAME_INPUT')}
                                           placeholder={I18n.get('USERNAME_PLACEHOLDER')}
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="account"/>
                                           }
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           autoCapitalize="none"
                                           value={values?.username}
                                           onChangeText={handleChange('username')}
                                           onBlur={handleBlur('username')}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}
                                           error={!!errors?.username}/>
                                {
                                    touched?.username && errors?.username && (
                                        <HelperText type="error">
                                            {I18n.get(errors.username)}
                                        </HelperText>
                                    )
                                }

                            </View>

                            <Button icon="lock-open"
                                    style={mbCommonStyles.submitBtn}
                                    disabled={Object.keys(errors).length > 0}
                                    mode="contained" onPress={handleSubmit}>
                                {I18n.get('RECOVERY')}
                            </Button>
                        </Fragment>
                    )}
                </Formik>

                <MBDividerText text={I18n.get('OR')} textColor={null}/>

                <View style={{
                    marginVertical: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: "row",
                    paddingBottom: 20
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '900',
                        color: '#000000'
                    }}>
                        {I18n.get('YOU_REMEMBER')}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.forgotPasswordButtonText}> {I18n.get('SING_IN')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
    scrollView: {
        marginHorizontal: 20,
    },
    forgotPasswordButtonText: {
        color: '#0771B8',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

