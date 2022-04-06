import {StyleSheet} from "react-native";

export const mbCommonStyles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        marginHorizontal: 20
    },
    viewRow: {
        flex: 1,
        flexDirection: "row",
    },
    viewStart50: {
        alignSelf: "flex-start",
        flex: 0.4
    },
    viewEnd50: {
        alignSelf: "flex-end",
        flex: 0.4
    },
    textInputStyle: {
        backgroundColor: '#EEEEEE',
        borderColor: '#97A19A',
        fontFamily: 'Roboto'
    },
    submitBtn: {
        fontFamily: 'Roboto',
        marginTop: 60,
        marginBottom: 30,
        borderRadius: 50,
        padding: 5,
        marginHorizontal: 20,
        backgroundColor: '#E98A3C',
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    viewForm: {
        marginBottom: 10
    }
});
