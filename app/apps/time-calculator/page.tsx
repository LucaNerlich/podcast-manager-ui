'use client';

import React from 'react';
import TimeCalculator from './TimeCalculator';

export default function TimeCalculatorPage() {
    return (
        <div className="container">
            <header>
                <h1 className="page-title">Time Calculator</h1>
                <p className="description">Convert between different time units and formats</p>
            </header>
            <main>
                <TimeCalculator/>
            </main>

            <style jsx>{`
                .container {
                    padding: 1rem;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .page-title {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
                
                .description {
                    color: #666;
                    font-size: 1.1rem;
                }
                
                @media (min-width: 768px) {
                    .container {
                        padding: 2rem;
                    }
                    
                    .page-title {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
