import React from "react";
import {TextInput} from "react-native-paper";

// @ts-ignore
export default function MBCommonTextInput({params, ...props}) {


    return (
            <TextInput
                mode='outlined'
                label={params.translate[params.locale || 'es']}
                placeholder={params.translate[params.locale || 'es']}
                selectionColor="#97A19A"
                underlineColor="#97A19A"
                left={
                    <TextInput.Icon
                        color="#97A19A"
                        name={params.icon}/>
                }
                {...props}
                style={{
                    backgroundColor: '#EEEEEE',
                    borderColor: '#97A19A'
                }}/>
    )
}
