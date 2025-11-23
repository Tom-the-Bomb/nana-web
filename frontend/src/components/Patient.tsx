import Dropdown from "./Dropdown";
import Test from "./Test";

import check from '../assets/check.svg';
import cross from '../assets/cross.svg';
import { useState } from "react";

export interface PatientProps {
    name: string;
    id: string;
}

export function Patient({patient, dataName, dataId}: {patient: any, dataName: string, dataId: string}) {
    const [error, setError] = useState<string | null>(null);

    async function startTest() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/start`, {
                method: 'POST',
                body: JSON.stringify({
                    patientId: patient.patient_id
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.message);
            }
        } catch (err: unknown) {
            setError('Internal error occurred');
        }
    }
            console.log(patient);
    const pass = patient.tests.length > 0
        ? patient.tests[patient.tests.length - 1].questions.every((q: any) => q.pass)
        : true;

    return (
        <li
            data-name={dataName}
            data-id={dataId}
            data-passed={pass}
            className="flex flex-col gap-2 border border-slate-300 rounded-md p-4"
        >
            <Dropdown
                header={
                    <>
                        {
                            pass
                                ? <img src={check} alt="Pass" className="w-5 stroke-green-500"/>
                                : <img src={cross} alt="Fail" className="w-5 stroke-red-500"/>
                        }
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-sm text-slate-600">(ID: {patient.patient_id})</span>
                    </>
                }
                content={
                    <div className="flex flex-col gap-4">
                        <hr className="text-slate-500"/>
                        <div className="flex gap-3 items-center justify-between">
                            <div>
                                <span className="font-medium">Date of Birth: </span>
                                {new Date(patient.dob).toDateString()}
                            </div>
                            {
                                error === ''
                                    ? <button
                                        type="button"
                                        onClick={startTest}
                                        className="basic-btn"
                                        disabled
                                    >
                                        Test started..
                                    </button>
                                    : <div className="flex gap-3 items-center">
                                        <button
                                            type="button"
                                            onClick={startTest}
                                            className="basic-btn"
                                        >
                                            Start Test
                                        </button>
                                        {error && <span className="error">{error}</span>}
                                    </div>
                            }
                        </div>
                        <ul>
                            {
                                patient.tests.map((test: any, idx: number) => (
                                    <Test key={idx} index={idx} test={test}/>
                                ))
                            }
                        </ul>
                    </div>
                }
            />
        </li>
    )
}