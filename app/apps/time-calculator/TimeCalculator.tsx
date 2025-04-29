'use client';

import React, {useState} from 'react';
import {useFormState} from 'react-dom';
import styles from '../../page.module.css';

type TimeUnit = 'seconds' | 'milliseconds' | 'minutes' | 'hours';

interface TimeState {
    hours: number;
    minutes: number;
    seconds: number;
    outputUnit: TimeUnit;
    result: string | null;
    error: string | null;
}

const initialState: TimeState = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    outputUnit: 'seconds',
    result: null,
    error: null
};

function calculateTime(prevState: TimeState, formData: FormData): TimeState {
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const outputUnit = formData.get('outputUnit') as TimeUnit || 'seconds';

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return {
            ...prevState,
            hours,
            minutes,
            seconds,
            outputUnit,
            error: 'Please enter valid numbers',
            result: null
        };
    }

    // Calculate total in seconds
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    let result: string;
    switch (outputUnit) {
        case 'milliseconds':
            result = `${totalSeconds * 1000} milliseconds`;
            break;
        case 'seconds':
            result = `${totalSeconds} seconds`;
            break;
        case 'minutes':
            result = `${(totalSeconds / 60).toFixed(2)} minutes`;
            break;
        case 'hours':
            result = `${(totalSeconds / 3600).toFixed(2)} hours`;
            break;
        default:
            result = `${totalSeconds} seconds`;
    }

    return {
        hours,
        minutes,
        seconds,
        outputUnit,
        result,
        error: null
    };
}

// Milliseconds to time conversion
function millisecondsToTime(milliseconds: number) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return {
        hours: hours,
        minutes: minutes % 60,
        seconds: seconds % 60,
        milliseconds: milliseconds % 1000
    };
}

export default function TimeCalculator() {
    const [state, formAction] = useFormState(calculateTime, initialState);
    const [milliseconds, setMilliseconds] = useState<string>('');
    const [msResult, setMsResult] = useState<string | null>(null);

    const handleMillisecondsConversion = (e: React.FormEvent) => {
        e.preventDefault();
        const ms = Number(milliseconds);

        if (isNaN(ms)) {
            setMsResult('Please enter a valid number');
            return;
        }

        const time = millisecondsToTime(ms);
        setMsResult(`${time.hours}h ${time.minutes}m ${time.seconds}s ${time.milliseconds}ms`);
    };

    return (
        <div className="time-calculator">
            <div className={styles.card + " calculator-section"}>
                <h2>Time to Unit Converter</h2>
                <form action={formAction} className="time-form">
                    <div className="input-group">
                        <label htmlFor="hours">Hours:</label>
                        <input
                            type="number"
                            id="hours"
                            name="hours"
                            min="0"
                            defaultValue={state.hours}
                            placeholder="0"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="minutes">Minutes:</label>
                        <input
                            type="number"
                            id="minutes"
                            name="minutes"
                            min="0"
                            max="59"
                            defaultValue={state.minutes}
                            placeholder="0"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="seconds">Seconds:</label>
                        <input
                            type="number"
                            id="seconds"
                            name="seconds"
                            min="0"
                            max="59"
                            defaultValue={state.seconds}
                            placeholder="0"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="outputUnit">Convert to:</label>
                        <select
                            id="outputUnit"
                            name="outputUnit"
                            defaultValue={state.outputUnit}
                        >
                            <option value="seconds">Seconds</option>
                            <option value="milliseconds">Milliseconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                        </select>
                    </div>

                    <button type="submit" className="calculate-btn">Calculate</button>
                </form>

                {state.error && <div className="error">{state.error}</div>}
                {state.result && <div className="result">{state.result}</div>}
            </div>

            <div className={styles.card + " calculator-section"}>
                <h2>Milliseconds to Time</h2>
                <form onSubmit={handleMillisecondsConversion} className="ms-form">
                    <div className="input-group">
                        <label htmlFor="ms-input">Milliseconds:</label>
                        <input
                            type="number"
                            id="ms-input"
                            value={milliseconds}
                            onChange={(e) => setMilliseconds(e.target.value)}
                            placeholder="Enter milliseconds"
                        />
                    </div>

                    <button type="submit" className="calculate-btn">Convert</button>
                </form>

                {msResult && <div className="result">{msResult}</div>}
            </div>

            <style jsx>{`
                .time-calculator {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    max-width: 100%;
                    padding: 1rem;
                }

                .calculator-section {
                    margin-bottom: 0;
                }

                h2 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                }

                .time-form, .ms-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-weight: 500;
                }

                input, select {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                .calculate-btn {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                    font-weight: 500;
                }

                .calculate-btn:hover {
                    background-color: #0060df;
                }

                .error {
                    color: #e00;
                    margin-top: 1rem;
                }

                .result {
                    margin-top: 1rem;
                    padding: 1rem;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                    font-weight: 500;
                }

                @media (min-width: 768px) {
                    .time-calculator {
                        padding: 2rem;
                    }

                    .input-group {
                        flex-direction: row;
                        align-items: center;
                    }

                    label {
                        min-width: 100px;
                    }

                    input, select {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
}
