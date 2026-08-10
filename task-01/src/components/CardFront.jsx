import React, { useRef } from 'react';
import '../styles/cardStyles.css';

const stripes = ['r', 'y', 'g', 'p', 'b', 'w', 'r', 'y', 'g', 'p', 'b'];

export default function CardFront({ formData = {}, croppedImageURL, serial, cardRef }) {
  const fallbackSerial = useRef(String(Math.floor(Math.random() * 900) + 100));
  const cardSerial = serial || fallbackSerial.current;
  const nameParts = (formData.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'YOUR';
  const lastName = nameParts.slice(1).join(' ') || 'NAME';

  return (
    <div className="card-front" ref={cardRef}>
      <div className="perf-top" />
      <div className="f-left-border">
        {stripes.map((stripe, index) => (
          <div className={`f-lb-stripe ${stripe}`} key={`top-${index}`} />
        ))}
        <div className="f-lb-text">REGISTERED BUILDER</div>
        {stripes.slice(0, 5).map((stripe, index) => (
          <div className={`f-lb-stripe ${stripe}`} key={`bottom-${index}`} />
        ))}
        <div className="f-lb-num">{cardSerial.slice(-2)}</div>
      </div>

      <div className="f-main">
        <div className="f-top-block">
          <div className="f-hh-big">
            HACKER
            <br />
            <span className="word2">HOUSE</span>
          </div>
          <div className="f-header-row2">
            <div className="f-header-hindi">
              हैकर
              <br />
              हाउस
            </div>
            <div>
              <div className="f-header-goa">GOA</div>
              <div className="f-header-year">OCT 28–31 · ARAMBOL BEACH</div>
            </div>
          </div>
        </div>
        <div className="f-color-bar" />
        <div className="f-body">
          <div className="f-person-zone">
            {croppedImageURL ? (
              <img
                src={croppedImageURL}
                alt="Builder"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />
            ) : (
              <div className="f-person-ph">
                YOUR
                <br />
                FACE
                <br />
                GOES
                <br />
                HERE
                <br />
                (BIG
                <br />
                AND
                <br />
                COOL)
              </div>
            )}
          </div>
          <div className="f-person-sticker">★ 100% SHIPPED</div>
          <div className="f-person-annotation">QUALITY BUILDER · BUILT IN GOA</div>
          <div className="f-info-left">
            <div className="f-eyebrow">// REGISTERED BUILDER #{cardSerial}</div>
            <div className="f-name-first">{firstName}</div>
            <div className="f-name-last">{lastName}</div>
            <div className="f-title-box">
              <span>{formData.builderTitle || 'BUILDER ALIAS'}</span>
            </div>
          </div>
          <div className="f-float-label">SHIP IT →</div>
          <div className="f-float-seal">
            <div className="seal-big">GOA</div>
            <div className="seal-sm">COMPAT.</div>
            <div className="seal-sm">100%</div>
          </div>
        </div>
        <div className="f-goa-band">
          <div className="f-goa-elements">
            <svg width="16" height="28" viewBox="0 0 16 28" aria-hidden="true">
              <rect x="6" y="11" width="3" height="17" rx="1.5" fill="#F0C229" />
              <ellipse cx="8" cy="9" rx="7" ry="4.5" fill="#F5EDD8" transform="rotate(-10 8 9)" />
              <ellipse cx="8" cy="6" rx="5.5" ry="3.5" fill="#F0C229" transform="rotate(8 8 6)" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <circle cx="7" cy="7" r="5" fill="none" stroke="#F0C229" strokeWidth="1.5" />
              <path
                d="M7 2 Q11.5 7 7 12 M7 2 Q2.5 7 7 12"
                fill="none"
                stroke="#F0C229"
                strokeWidth="1"
              />
              <circle cx="7" cy="7" r="1.2" fill="#F0C229" />
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
              <path
                d="M0 6 Q6 0 12 6 Q18 12 24 6"
                fill="none"
                stroke="#F0C229"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect width="14" height="14" rx="2" fill="none" stroke="#F0C229" />
              <path d="M7 0v14M0 7h14" stroke="#F0C229" />
              <circle cx="7" cy="7" r="2" fill="#F0C229" />
            </svg>
          </div>
          <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
            <div className="f-goa-text">GOA</div>
            <div className="f-goa-sub">गोवा · 2026</div>
          </div>
        </div>
        <div className="f-easter-strip">
          {[
            'GIT PUSH',
            '404: SLEEP NOT FOUND',
            'LOCALHOST',
            'BUILD: PASSED',
            'JUGAAD v2.6',
            'SHIP IT',
          ].map((item) => (
            <div className="f-e-chip" key={item}>
              {item}
            </div>
          ))}
        </div>
        <div className="f-bottom">
          <div className="f-bottom-l">MADE IN GOA</div>
          <div className="f-bottom-r">HHGOA.COM · OCT 2026</div>
        </div>
        <div className="perf-bot" />
      </div>
    </div>
  );
}
