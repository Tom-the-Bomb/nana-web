import { useEffect, useRef, useState } from 'react';
import { Patient } from './Patient';

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/patients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                }
                return res.json();
            })
            .then((data) => {
                setPatients(data.patients);
                setIsLoading(false);
            });
    }, []);

    const patientSearchRef = useRef<HTMLInputElement>(null);
    const patientFailedRef = useRef<HTMLInputElement>(null);
    const patientLastTestedRef = useRef<HTMLInputElement>(null);
    const patientsRef = useRef<HTMLUListElement>(null);

    const patientNameRef = useRef<HTMLInputElement>(null);
    const patientDobRef = useRef<HTMLInputElement>(null);
    const patientIdRef = useRef<HTMLInputElement>(null);

    function patientSearch() {
        const filterCheck = patientSearchRef.current?.value.toLowerCase() || '';
        const failedCheck = patientFailedRef.current?.checked;
        const lastTestedCheck = patientLastTestedRef.current?.checked;

        for (const li of patientsRef.current?.getElementsByTagName('li')!) {
            const name = li.getAttribute('data-name') || '';
            const id = li.getAttribute('data-id') || '';
            const passed = li.getAttribute('data-passed') === 'true';

            li.style.display = (
                (name.toLowerCase().indexOf(filterCheck) > -1
                || id.indexOf(filterCheck) > -1)
                && (failedCheck ? !passed : true)
            )
                ? 'flex'
                : 'none';
        }

        const copy = patients.slice();
        copy.sort((a, b) => {
            if (lastTestedCheck) {
                const aDate = a.tests.length > 0 ? new Date(a.tests[a.tests.length - 1].date).getTime() : 0;
                const bDate = b.tests ? new Date(b.tests[b.tests.length - 1].date).getTime() : 0;
                return bDate - aDate;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        setPatients(copy);
    }

    const [error, setError] = useState<string>('');

    async function addPatient(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = patientNameRef.current?.value;
        const dob = patientDobRef.current?.value;
        const id = patientIdRef.current?.value;

        try {
            const patient = {
                name,
                dob,
                patient_id: id,
                tests: [],
            };
            const response = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(patient)
            });

            if (response.ok) {
                setPatients([...patients, patient]);

                if (patientNameRef.current) patientNameRef.current.value = '';
                if (patientDobRef.current) patientDobRef.current.value = '';
                if (patientIdRef.current) patientIdRef.current.value = '';
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch (err: unknown) {
            setError('Internal error occurred');
        }
    }

    return (
        <main className="flex flex-col grow gap-10 justify-center items-center py-10 px-0">
            <h1 className="text-4xl font-bold">Patients</h1>
            <div className="flex gap-5 items-center">
                <input ref={patientSearchRef} type="text" className="txt-input" id="myInput" onChange={patientSearch} placeholder="Search for patients.."/>
                <label htmlFor="failed-filter" className="text-gray-700">
                    <input ref={patientFailedRef} type="checkbox" id="failed-filter" onChange={patientSearch}/> Failed
                </label>
                <label htmlFor="last-tested" className="text-gray-700">
                    <input ref={patientLastTestedRef} type="checkbox" id="last-tested" onChange={patientSearch} /> Sort by last tested
                </label>
            </div>
            <ul ref={patientsRef} className="flex flex-col gap-5 w-2/3 round-box p-5">
                {
                    isLoading
                        ? <li>Loading...</li>
                        : patients.map((patient) => (
                            <Patient
                                key={patient.patient_id}
                                patient={patient}
                                dataName={patient.name}
                                dataId={patient.patient_id}
                            />
                        ))
                }
            </ul>
            <div className="flex flex-col gap-3 justify-center items-center">
                <span className="text-sm text-slate-500">Total Patients: {patients.length}</span>
                <form onSubmit={addPatient} className="flex flex-col gap-2 round-box p-5">
                    <input
                        ref={patientNameRef}
                        className="txt-input"
                        type="text"
                        name="patientName"
                        placeholder="Full name"
                        required
                    />
                    <input
                        ref={patientIdRef}
                        className="txt-input"
                        type="number"
                        name="patientID"
                        placeholder="Patient ID"
                        required
                    />
                    <input
                        ref={patientDobRef}
                        className="txt-input"
                        type="text"
                        name="patientDob"
                        placeholder="Birthdate"
                        onFocus={(e) => e.currentTarget.type = 'date'}
                        onBlur={(e) => e.currentTarget.type = 'text'}
                        required
                    />
                    {error && <span className="error">{error}</span>}
                    <button
                        type="submit"
                        className="basic-btn"
                    >
                        Add Patient
                    </button>
                </form>
            </div>
        </main>
    )
}