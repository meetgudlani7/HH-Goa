import React from 'react';
import '../styles/cardStyles.css';

const barcode = [
  '',
  'w',
  '',
  'm',
  'w',
  '',
  '',
  'g',
  'm',
  'w',
  '',
  'm',
  'w',
  '',
  'g',
  '',
  'm',
  '',
  'g',
  'w',
  '',
  '',
  'm',
  'g',
  '',
  'w',
  '',
  'm',
  '',
  'w',
  '',
  'g',
  '',
  'm',
  'w',
  '',
  '',
  'm',
  'g',
  '',
];

export default function CardBack({ formData = {}, serial, cardRef }) {
  const name = (formData.name || 'BUILDER').toUpperCase();
  const lastName = name.trim().split(/\s+/).slice(1).join('-') || 'BUILDER';
  const stack = (formData.stack || 'YOUR STACK')
    .split(/[/,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  const batch = `GOA-26-${serial}`;
  return (
    <div className="card-back" ref={cardRef}>
      <div className="back-top-stripe" />
      <div className="back-wm">HH</div>
      <div className="back-header">
        <div>
          <div className="back-h-brand">PRODUCT INFO</div>
          <div className="back-h-sub">CERTIFIED BUILDER UNIT · HACKER HOUSE GOA 2026</div>
        </div>
        <div className="back-batch-box">
          <div className="back-batch-num">{batch}</div>
          <span className="back-batch-label">BATCH NO.</span>
        </div>
      </div>
      <div className="back-perf-inner" />
      <div className="back-body">
        <div className="back-tile-row" />
        <div className="back-stamps-row">
          <span className="h-stamp">BUILT IN GOA</span>
          <span className="h-stamp red">100% SHIPPED</span>
          <span className="h-stamp blue">GIT PUSH ✓</span>
        </div>
        <div className="back-section-label">INGREDIENTS (PER BUILDER)</div>
        <table className="ing-table">
          <tbody>
            <tr>
              <td>{stack.join(' / ') || 'YOUR STACK'}</td>
              <td>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '62%' }} />
                </div>
              </td>
              <td>62%</td>
            </tr>
            <tr>
              <td>CONTROLLED CHAOS</td>
              <td>
                <div className="bar-track">
                  <div className="bar-fill p" style={{ width: '18%' }} />
                </div>
              </td>
              <td>18%</td>
            </tr>
            <tr>
              <td>BLACK COFFEE (ARABICA)</td>
              <td>
                <div className="bar-track">
                  <div className="bar-fill y" style={{ width: '10%' }} />
                </div>
              </td>
              <td>10%</td>
            </tr>
            <tr>
              <td>GOA SUNLIGHT (UV-GRADE)</td>
              <td>
                <div className="bar-track">
                  <div className="bar-fill g" style={{ width: '7%' }} />
                </div>
              </td>
              <td>7%</td>
            </tr>
            <tr>
              <td>QUESTIONABLE IDEAS (TRACE)</td>
              <td>
                <div className="bar-track">
                  <div className="bar-fill b" style={{ width: '3%' }} />
                </div>
              </td>
              <td>3%</td>
            </tr>
          </tbody>
        </table>
        <div className="back-tile-row" />
        <div className="back-section-label">DIRECTIONS FOR USE</div>
        <ul className="directions">
          <li>Deploy to production at 3AM. No exceptions. No mercy.</li>
          <li>Pair with strong chai. Replace dinner with one more sprint.</li>
          <li>If stuck: blame Wi-Fi. Blame humidity. Ship anyway.</li>
          <li>In case of BUILD FAILED — see JUGAAD manual, appendix D.</li>
          <li>Valid only: Arambol Beach, Goa · Oct 28–31, 2026.</li>
        </ul>
        <div className="back-warning">
          <div className="back-warning-text">
            MAY CAUSE: Involuntary side projects, 3AM deployments, excessive API burn, unsolicited
            opinions on tech stacks, tropical dehydration, sand in the keyboard, and uncontrollable
            urge to rewrite everything in TypeScript. Keep away from sleep schedules, reasonable
            deadlines, and anyone who says “let’s not ship this yet.”
          </div>
        </div>
        <div className="back-mfg">
          <div className="back-mfg-text">
            FOR: {name}
            <br />
            ALIAS: {(formData.builderTitle || 'BUILDER ALIAS').toUpperCase()}
            <br />
            HOME CITY: {(formData.city || 'GOA, INDIA').toUpperCase()}
            <br />
            MFG. AT: HACKER HOUSE, GOA, INDIA
            <br />
            MFG. DATE: OCTOBER 2026
            <br />
            BEST BEFORE: HEAT DEATH OF UNIVERSE
            <br />
            CERTIFIED BY: @247PMSTUDIO
          </div>
          <div className="back-mfg-hindi">गोवा</div>
        </div>
        <div className="back-barcode">
          <div className="back-bars">
            {barcode.map((kind, index) => (
              <div className={`bbar ${kind}`} key={index} />
            ))}
          </div>
          <div className="back-barnum">
            HH-GOA-2026-{serial}-{lastName}
          </div>
        </div>
      </div>
      <div className="back-bot-stripe" />
    </div>
  );
}
