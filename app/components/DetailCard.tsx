import React, {ReactNode} from 'react';
import Image from 'next/image';

interface DetailCardProps {
    title: string;
    imageUrl?: string;
    description: string;
    metadata?: ReactNode;
    actions?: ReactNode;
    listingTitle?: string;
    listingItems?: ReactNode;
}

export default function DetailCard({
                                       title,
                                       imageUrl,
                                       description,
                                       metadata,
                                       actions,
                                       listingTitle,
                                       listingItems
                                   }: DetailCardProps) {
    return (
        <div className="detail-page">
            <div className="detail-card">
                <div className="detail-content">
                    {imageUrl && (
                        <div className="detail-image-container">
                            <Image
                                src={imageUrl}
                                alt={title}
                                width={150}
                                height={150}
                                className="detail-image"
                            />
                        </div>
                    )}

                    <div className="detail-info">
                        <h1 className="detail-title">{title}</h1>
                        {metadata && (
                            <div className="detail-metadata">
                                {metadata}
                            </div>
                        )}
                        {actions && actions}
                    </div>
                </div>

                {description &&
                  <div className="detail-description">
                      <h2>Beschreibung</h2>
                      <div className="description-content">
                          {description}
                      </div>
                  </div>
                }
            </div>

            {listingTitle && listingItems && (
                <div className="detail-listing">
                    <h2>{listingTitle}</h2>
                    <div className="detail-listing-items">
                        {listingItems}
                    </div>
                </div>
            )}
        </div>
    );
}
