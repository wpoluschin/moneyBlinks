import React from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {Divider, Text} from "react-native-paper";
import {I18n} from "aws-amplify";

import {themeDefault} from "../../../constants/Colors";
import {mbCommonStyles} from "../../../constants/styles";

export default function Status() {


    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
                <View style={{
                    marginTop: 20,
                    flexDirection: "row"
                }}>
                    <Text style={{
                        fontSize: 20,
                        flex: 0.5,
                        fontWeight: "bold",
                        textAlignVertical: "center",
                        textAlign: "left",
                        color: themeDefault.colors.placeholder
                    }}>
                        {I18n.get('CURRENT_STATUS')}
                    </Text>
                    <Text style={{
                        fontSize: 20,
                        flex: 0.5,
                        fontWeight: "bold",
                        textAlignVertical: "center",
                        textAlign: "right",
                        color: themeDefault.colors.warn
                    }}>
                        {I18n.get('MEMBER')}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                    marginTop: 40,
                    marginBottom: 10
                }}>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.primary,
                        fontSize: 14,
                        textAlign: "right",
                        marginRight: 5
                    }}>
                        {I18n.get('STATUS')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.primary,
                        fontSize: 14,
                        textAlign: "left",
                        marginLeft: 5
                    }}>
                        {I18n.get('POINTS_REQUIRED')}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                    marginBottom: 10
                }}>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "right",
                        marginRight: 5
                    }}>
                        {I18n.get('SILVER')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "left",
                        marginLeft: 5
                    }}>
                        {` 1 500`}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                    marginBottom: 10
                }}>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "right",
                        marginRight: 5
                    }}>
                        {I18n.get('GOLD')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "left",
                        marginLeft: 5
                    }}>
                        {` 5 000`}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                    marginBottom: 10
                }}>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "right",
                        marginRight: 5
                    }}>
                        {I18n.get('PLATINUM')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "left",
                        marginLeft: 5
                    }}>
                        {`25 000`}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                    marginBottom: 10
                }}>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "right",
                        marginRight: 5
                    }}>
                        {I18n.get('ELITE')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.placeholder,
                        fontSize: 14,
                        textAlign: "left",
                        marginLeft: 5
                    }}>
                        {`50 000`}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginTop: 40,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.primary,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        {I18n.get('LEVEL')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.primary,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        {I18n.get('DOWNLOADS')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.primary,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        {I18n.get('USES')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.primary,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        {I18n.get('POINTS')}
                    </Text>
                </View>
                <Divider style={{
                    height: 2,
                    backgroundColor: themeDefault.colors.primary
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        1
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 1
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        2
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 1
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        3
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 1
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        4
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 1
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        5
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 1
                }}/>
                <View style={{
                    flexDirection: "row",
                    marginVertical: 10,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "center",
                        flex: 0.2
                    }}>
                        6
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.placeholder,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
                <Divider  style={{
                    height: 2,
                    backgroundColor: themeDefault.colors.primary
                }}/>
                <View style={{
                    flexDirection: "row",
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.primary,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.2
                    }}>
                        {I18n.get('TOTAL')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        textAlign: "right",
                        flex: 0.3
                    }}>
                        0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
