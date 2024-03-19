//
//
import { AiOutlineQuestion } from "react-icons/ai";
//
//
type Props = {
    onClk: () => void;
};
//
//
export default function ({ onClk }: Props) {
    return (
        <AiOutlineQuestion
            className="Btn B-1-Y c-y P-05 Rnd TB"
            size={"1.7em"}
            onClick={onClk}
        />
    );
}
