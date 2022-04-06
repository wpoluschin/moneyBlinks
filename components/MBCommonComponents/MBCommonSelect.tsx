import React, {useEffect, useState} from "react";
import {StyleSheet} from "react-native";
import {I18n} from "aws-amplify";
import DropDownPicker from "react-native-dropdown-picker";

// @ts-ignore
export default function MBCommonSelect({params, setFieldValue, ...props}) {

    const [items, setItems] = useState([]);
    const [openUsedMethod, setOpenUsedMethod] = useState(false);
    const [usedMethod, setUsedMethod] = useState<any>(null);

    useEffect(() => {
        const listItems: any = [];
        params.values.forEach((item: any) => {
            listItems.push({
                value: item.code,
                label: item.label[params.locale] || item.label
            });
        });
        setItems(listItems);
    }, []);

    useEffect(() => {
        setFieldValue(`${params?.name}`, usedMethod, true);
    },[
        usedMethod
    ])

    return (
        <DropDownPicker
            open={openUsedMethod}
            setOpen={setOpenUsedMethod}
            itemKey="value"
            closeAfterSelecting={true}
            searchable={true}
            listMode="MODAL"
            mode="BADGE"
            {...props}
            multiple={false}
            searchPlaceholder={I18n.get('SEARCH_ITEM')}
            items={items}
            value={usedMethod}
            setValue={setUsedMethod}
        />
    )
}


const styles = StyleSheet.create({
    picker: {
        height: 55,
        width: '100%',
        backgroundColor: '#EEEEEE',
        borderColor: '#97A19A'
    }
});
