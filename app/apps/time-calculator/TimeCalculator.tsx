'use client';

import React, {useState} from 'react';
import {useFormState} from 'react-dom';
import pageStyles from '../../page.module.css'; // For styles.card
import styles from './time-calculator.module.css'; // Specific styles for this app

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

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    let resultValue: string;
    switch (outputUnit) {
        case 'milliseconds':
            resultValue = `${totalSeconds * 1000} milliseconds`;
            break;
        case 'seconds':
            resultValue = `${totalSeconds} seconds`;
            break;
        case 'minutes':
            resultValue = `${(totalSeconds / 60).toFixed(2)} minutes`;
            break;
        case 'hours':
            resultValue = `${(totalSeconds / 3600).toFixed(2)} hours`;
            break;
        default:
            resultValue = `${totalSeconds} seconds`;
    }
    return {
        hours, minutes, seconds, outputUnit,
        result: resultValue,
        error: null
    };
}

function millisecondsToTime(milliseconds: number) {
    const secs = Math.floor(milliseconds / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    return {
        hours: hrs,
        minutes: mins % 60,
        seconds: secs % 60,
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
        <div className={styles.calculatorContainer}>
            <div className={`${pageStyles.card} ${styles.calculatorSection}`}>
                <h2 className={styles.title}>Time to Unit Converter</h2>
                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="hours" className={styles.label}>Hours:</label>
                        <input
                            type="number"
                            id="hours"
                            name="hours"
                            min="0"
                            defaultValue={state.hours}
                            placeholder="0"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="minutes" className={styles.label}>Minutes:</label>
                        <input
                            type="number"
                            id="minutes"
                            name="minutes"
                            min="0"
                            max="59"
                            defaultValue={state.minutes}
                            placeholder="0"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="seconds" className={styles.label}>Seconds:</label>
                        <input
                            type="number"
                            id="seconds"
                            name="seconds"
                            min="0"
                            max="59"
                            defaultValue={state.seconds}
                            placeholder="0"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="outputUnit" className={styles.label}>Convert to:</label>
                        <select
                            id="outputUnit"
                            name="outputUnit"
                            defaultValue={state.outputUnit}
                            className={styles.select}
                        >
                            <option value="seconds">Seconds</option>
                            <option value="milliseconds">Milliseconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.calculateBtn}>Calculate</button>
                </form>
                {state.error && <div className={styles.errorMsg}>{state.error}</div>}
                {state.result && <div className={styles.resultMsg}>{state.result}</div>}
            </div>

            <div className={`${pageStyles.card} ${styles.calculatorSection}`}>
                <h2 className={styles.title}>Milliseconds to Time</h2>
                <form onSubmit={handleMillisecondsConversion} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="ms-input" className={styles.label}>Milliseconds:</label>
                        <input
                            type="number"
                            id="ms-input"
                            value={milliseconds}
                            onChange={(e) => setMilliseconds(e.target.value)}
                            placeholder="Enter milliseconds"
                            className={styles.input}
                        />
                    </div>
                    <button type="submit" className={styles.calculateBtn}>Convert</button>
                </form>
                {msResult && <div className={styles.resultMsg}>{msResult}</div>}
            </div>
        </div>
    );
}
