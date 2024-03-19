//
import React from "react";
//
//
export default function MyChkBox(label: string, onToggle: () => void) {
  //
  const [bool, setBool] = React.useState<boolean>(false);
  //
  //
  const handleToggle = () => {
    setBool(!bool);
    onToggle();
  };
  //
  //
  const compx = (
    <div className="DF AC">
      {label && <div className="FS-1-8 MR-1">{label}</div>}
      <button className="ChkBox" onClick={handleToggle}>
        <div className={bool ? "BG-G" : "BG-R"} />
      </button>
    </div>
  );
  //
  return [bool, compx];
}
