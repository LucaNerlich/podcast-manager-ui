'use client';
import React from 'react';

interface FeedProps {
}

export default function Feed(props: Readonly<FeedProps>): React.ReactElement {
    return (
        <div>
            <h3>Some Feed</h3>
            <p>some description</p>
            <ol>
                <li>Episode X</li>
                <li>Episode Y</li>
            </ol>
        </div>
    )
}
