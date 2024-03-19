//
import React from "react";
//
//
export default function MySelect(options: Array<any>) {
    //
    const [option, setSelectedOption] = React.useState<any>(null);
    //
    const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };
    //
    //
    const compx = (
        <select className="Select SP" onChange={selectChange}>
            {options.map((opt, i) => (
                <option key={i} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
    //
    return [option, compx];
}
