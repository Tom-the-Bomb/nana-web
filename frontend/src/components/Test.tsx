import Dropdown from "./Dropdown";

import check from '../assets/check.svg';
import cross from '../assets/cross.svg';

export default function Test({test, index}: {test: any, index: number}) {
    return (
        <li className="flex flex-col gap-2 border border-slate-300 rounded-md p-4">
            <Dropdown
                header={
                    <>
                        {
                            test.questions.every((q: any) => q.pass)
                                ? <img src={check} alt="Pass" className="w-5 stroke-green-500"/>
                                : <img src={cross} alt="Fail" className="w-5 stroke-red-500"/>
                        }
                        <span className="font-medium">Test {index + 1}</span>
                        <span className="text-sm text-slate-600">({new Date(test.date).toDateString()})</span>
                    </>
                }
                content={
                    <div className="flex flex-wrap gap-2">
                        <video controls className="w-full lg:w-1/2 rounded-sm">
                            <source src={`${import.meta.env.VITE_API_URL}/videos/test_${index + 1}.mp4`} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div>
                            <ul className="list-disc list-inside">
                                {
                                    "I LIVE WITH YOUR MOM"
                                }
                            </ul>
                        </div>
                    </div>
                }
            />
        </li>
    );
}