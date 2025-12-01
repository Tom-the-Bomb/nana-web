import check from '../assets/check.svg';
import cross from '../assets/cross.svg';

export default function PassFail({pass}: {pass: boolean}) {
    return (
        <>
            {
                pass
                    ? <img src={check} alt="Pass" className="w-5 stroke-green-500"/>
                    : <img src={cross} alt="Fail" className="w-5 stroke-red-500"/>
            }
        </>
    );
}