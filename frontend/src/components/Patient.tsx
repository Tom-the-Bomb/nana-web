import Dropdown from "./Dropdown";
import Test from "./Test";

import { useRef, useState } from "react";
import PassFail from "./PassFail";

export function Patient({patient, dataName, dataId}: {patient: any, dataName: string, dataId: string}) {
    const [error, setError] = useState<string | null>(null);

    const deviceIDRef = useRef<HTMLInputElement>(null);

    async function startTest() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/test`, {
                method: 'POST',
                body: JSON.stringify({
                    patient_id: patient.patient_id,
                    device_id: deviceIDRef.current?.value,
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

    const pass = patient.tests.length > 0
        ? patient.tests[patient.tests.length - 1].questions.every((q: any) => q.pass)
        : true;

    return (
        <li
            data-name={dataName}
            data-id={dataId}
            data-passed={pass}
            className="flex flex-col gap-2 round-box p-4"
        >
            <Dropdown
                header={
                    <>
                        <PassFail pass={pass} />
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-sm text-slate-600">(ID: {patient.patient_id})</span>
                    </>
                }
                content={
                    <div className="flex flex-col gap-4">
                        <hr className="text-slate-500"/>
                        <div className="flex flex-wrap gap-3 items-center justify-between">
                            <div>
                                <span className="font-medium">Date of Birth: </span>
                                {new Date(patient.dob).toDateString()}
                            </div>
                            {
                                error === ''
                                    ? <>
                                        <input
                                            type="number"
                                            className="txt-input"
                                            placeholder="Device ID"
                                            ref={deviceIDRef}
                                            disabled
                                        />
                                        <button
                                            type="button"
                                            onClick={startTest}
                                            className="basic-btn"
                                            disabled
                                        >
                                            Test started..
                                        </button>
                                    </>
                                    : <div className="flex gap-3 items-center">
                                        <input
                                            type="number"
                                            className="txt-input"
                                            placeholder="Device ID"
                                            ref={deviceIDRef}
                                        />
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
                                [
                                    {
                                        "date": "2024-06-01T10:00:00Z",
                                        "questions": [
                                            {"description": "What is your name?", "answer": "Chloe James", pass: true},
                                            {"description": "What is your date of birth?", "answer": "April 19, 1973", pass: true},
                                            {"description": "Why are you in the hospital?", "answer": "concussion", pass: true},
                                            {"description": "What is your address?", "answer": "4hundred thirty seven Riverside Boulevard", pass: true}
                                        ],
                                        "pauses": 46.200053736613825,
                                        "stutters": [
                                            {
                                                "text": "uh",
                                                "count": 4
                                            },
                                            {
                                                "text": "um",
                                                "count": 2
                                            }
                                        ],
                                        "score": 85
                                    }
                                ].map((test: any, idx: number) => (
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