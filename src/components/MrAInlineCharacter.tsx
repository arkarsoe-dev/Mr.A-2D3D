import React from 'react';

type Props = { twod?: string; loading?: boolean };

export const MrAInlineCharacter: React.FC<Props> = ({ twod = '--', loading = false }) => {
  const display = loading ? '···' : twod || '--';
  return (
    <span className={`mra-inline-character ${loading ? 'is-loading' : ''}`} role="img" aria-label={`Mr.A character says live 2D ${display}`}>
      <span className="mra-inline-speech">2D Live <b>{display}</b></span>
      <span className="mra-bot-button" aria-hidden="true">
        <span className="mra-bot-antenna" />
        <span className="mra-bot-head"><span className="mra-bot-visor"><i /><i /></span></span>
        <span className="mra-bot-torso"><span className="mra-bot-arm mra-bot-arm-left" /><span className="mra-bot-chest"><b /><small>{display}</small></span><span className="mra-bot-arm mra-bot-arm-right" /></span>
        <span className="mra-bot-legs"><span className="mra-bot-leg mra-bot-leg-left"><em /></span><span className="mra-bot-leg mra-bot-leg-right"><em /></span></span>
      </span>
    </span>
  );
};
