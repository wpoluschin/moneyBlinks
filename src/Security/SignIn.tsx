import React, {useContext, useState} from "react";
import {Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {Button, HelperText, Text, TextInput} from "react-native-paper";
import {I18n} from "aws-amplify";
import Constants from "expo-constants";
import {Formik} from "formik";
import * as Yup from 'yup';

import {mbCommonStyles} from "../../constants/styles";
import {MBDividerText} from "../../components/MBCommonsComponets";
import MBContext from "../../contexts/MoneyBlinks/MBContext";


export default function SignIn() {

    const navigation = useNavigation();
    const [visiblePwd, setVisiblePwd] = useState<boolean>(false);

    const {handleAwsUser}: any = useContext(MBContext);

    async function onLogin(values: any) {
        await handleAwsUser(values?.username, values?.password);
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <Formik
                initialValues={{
                    username: '',
                    password: ''
                }}
                validationSchema={
                    Yup.object().shape({
                        username: Yup.string().nullable()
                            .min(4, 'USERNAME_INVALID')
                            .required('USERNAME_IS_REQUIRED'),
                        password: Yup.string().nullable()
                            .min(8, 'PASSWORD_INVALID')
                            .required('PASSWORD_IS_REQUIRED'),
                    })
                }
                onSubmit={onLogin}>
                {({
                      handleChange,
                      handleBlur,
                      setFieldValue,
                      handleSubmit,
                      errors,
                      touched,
                      values
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        <Image source={require('../../assets/images/logo-mb.png')}
                               style={{
                                   resizeMode: "contain",
                                   width: '100%',
                                   marginTop: -180,
                                   marginBottom: -230
                               }}/>
                        <View style={{marginBottom: 20}}>
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
                                       onChangeText={text => {
                                           handleChange('username')
                                           setFieldValue('username', text, true);
                                       }}
                                       onBlur={handleBlur('username')}
                                       style={{
                                           backgroundColor: '#EEEEEE',
                                           borderColor: '#97A19A'
                                       }}
                                       error={!!errors?.username}/>
                            {
                                touched?.username && errors?.username && (
                                    <HelperText type="error">
                                        {I18n.get('USERNAME_INVALID')}
                                    </HelperText>
                                )
                            }
                        </View>
                        <View>
                            {
                                visiblePwd &&
                                <TextInput mode='outlined'
                                           label={I18n.get('PASSWORD_INPUT')}
                                           placeholder={I18n.get('PASSWORD_PLACEHOLDER')}
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="lock"/>
                                           }
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           autoCapitalize="none"
                                           value={values?.password}
                                           onChangeText={handleChange('password')}
                                           onBlur={handleBlur('password')}
                                           error={!!errors?.password}
                                           right={
                                               <TextInput.Icon
                                                   name="eye"
                                                   color="#97A19A"
                                                   onPress={() => setVisiblePwd(false)}
                                               />
                                           }/>
                            }
                            {
                                !visiblePwd && (
                                    <TextInput mode='outlined'
                                               label={I18n.get('PASSWORD_INPUT')}
                                               placeholder={I18n.get('PASSWORD_PLACEHOLDER')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="lock"/>
                                               }
                                               textContentType="password"
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               secureTextEntry
                                               autoCapitalize="none"
                                               value={values?.password}
                                               onChangeText={handleChange('password')}
                                               onBlur={handleBlur('password')}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}
                                               error={!!errors?.password}
                                               right={
                                                   <TextInput.Icon
                                                       name="eye-off"
                                                       color="#97A19A"
                                                       onPress={() => setVisiblePwd(true)}
                                                   />
                                               }/>
                                )
                            }
                            {
                                touched?.password && errors?.password && (
                                    <HelperText type="error">
                                        {I18n.get('PASSWORD_INVALID')}
                                    </HelperText>
                                )
                            }
                        </View>

                        <Button icon="lock"
                                style={mbCommonStyles.submitBtn}
                                disabled={Object.keys(errors).length > 0}
                                mode="contained" onPress={handleSubmit}>
                            {I18n.get('SING_IN')}
                        </Button>

                        <MBDividerText text={I18n.get('OR')} textColor={null}/>

                        <View style={{
                            flexDirection: "column",
                            width: '100%',
                            alignItems: "center"
                        }}>
                            <View style={styles.footerButtonContainer}>
                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', {
                                    username: values?.username
                                })}>
                                    <Text style={styles.forgotPasswordButtonText}>
                                        {I18n.get('FORGOT_PASSWORD_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footerButtonContainer}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '900',
                                    color: '#000000'
                                }}>
                                    {I18n.get('DONT_HAVE_ACCOUNT')}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                    <Text style={styles.forgotPasswordButtonText}> {I18n.get('SING_UP')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
        marginBottom: 20
    },
    footerButtonContainer: {
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    forgotPasswordButtonText: {
        color: '#0771B8',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
