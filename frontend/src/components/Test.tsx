import React from "react";
import Dropdown from "./Dropdown";
import PassFail from "./PassFail";

export interface QuestionSchema {
    description: string;
    answer: string;
    pass: boolean;
}

export interface StutterSchema {
    text: string;
    count: number;
}

export interface TestSchema {
    date: string;
    pauses: number;
    score: number;
    stutters: StutterSchema[];
    questions: QuestionSchema[];
}

export default function Test({test, index}: {test: TestSchema, index: number}) {
    return (
        <li className="flex flex-col gap-2 round-box p-4">
            <Dropdown
                header={
                    <>
                        <PassFail pass={test.questions.every((q: QuestionSchema) => q.pass)} />
                        <span className="font-medium">Test {index + 1}</span>
                        <span className="text-sm text-slate-600">({new Date(test.date).toDateString()})</span>
                    </>
                }
                content={
                    <div className="flex flex-wrap gap-4">
                        <video controls className="w-full lg:w-1/2 rounded-sm">
                            <source src={`${import.meta.env.VITE_API_URL}/videos/test_${index + 1}.mp4`} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 text-gray-800 font-medium round-box p-2">
                                <span>Paused for <span className="text-red-500">{Math.round(test.pauses)}%</span> of the response time.</span>
                                <span>
                                    Said
                                    {
                                        test.stutters.map((s: StutterSchema, idx: number) =>
                                            <React.Fragment key={idx}>
                                                &nbsp;{s.count} <span className="text-red-500">{s.text}</span>
                                                <span className="text-xs text-gray-500">(s)</span>
                                            </React.Fragment>
                                        )
                                    }
                                </span>
                            </div>
                            <div className="round-box p-2 text-gray-800 font-medium">
                                Scored
                                <span className="text-green-600"> {test.score} </span>
                                on Simon Says
                            </div>
                            <Dropdown
                                header={<span className="font-medium">Questions</span>}
                                content={
                                    <ul className="flex flex-col gap-2">
                                        {
                                            test.questions.map((q: QuestionSchema, idx: number) =>
                                                <li key={idx} className="font-jetbrains-mono text-gray-900">
                                                    <Dropdown
                                                        header={
                                                            <>
                                                                <PassFail pass={q.pass} />
                                                                <span className="text-sm">
                                                                    <span className="text-gray-400">[{idx + 1}] </span>
                                                                    {q.description}
                                                                </span>
                                                            </>
                                                        }
                                                        content={
                                                            <div className="font-light text-sm text-gray-700">
                                                                {q.answer && <><span className="font-medium">Answer:</span> {q.answer}</>}
                                                            </div>
                                                        }
                                                    />
                                                </li>
                                            )
                                        }
                                    </ul>
                                }
                            />
                        </div>
                    </div>
                }
            />
        </li>
    );
}