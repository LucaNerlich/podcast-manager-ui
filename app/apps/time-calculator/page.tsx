'use client';

import React from 'react';
import TimeCalculator from './TimeCalculator';
import localStyles from './time-calculator.module.css';

export default function TimeCalculatorPage() {
    return (
        <div className={localStyles.container}>
            <header className={localStyles.header}>
                <h1 className={localStyles.pageTitle}>Time Calculator</h1>
                <p className={localStyles.description}>Convert between different time units and formats</p>
            </header>
            <main>
                <TimeCalculator/>
            </main>
        </div>
    );
}
