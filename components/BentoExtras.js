'use client'
import SnakeGame from './SnakeGame'
import ReactionTest from './ReactionTest'
import Magic8Ball from './Magic8Ball'
import GravitySandbox from './GravitySandbox'
import T7Ticker from './T7Ticker'
import Net30 from './Net30'
import AliveCounter from './AliveCounter'
import PhotoQuiz from './PhotoQuiz'
import ChargeWheel from './ChargeWheel'
import C1Export from './C1Export'

function Cell({ id, num, name, size, children }) {
  return (
    <div className={`bento-cell bento-${size}`} id={id}>
      <div className="bento-label">
        <span className="bento-num">{num}</span>
        <span className="bento-sep">·</span>
        <span className="bento-name">{name}</span>
      </div>
      <div className="bento-content">
        {children}
      </div>
    </div>
  )
}

export default function BentoExtras() {
  return (
    <div className="bento-wrap">
      <div className="bento-header">
        <h1 className="bento-title">Extras</h1>
        <p className="bento-sub">Things that have nothing to do with photography.</p>
      </div>

      <div className="bento-grid">
        <Cell id="t7" num="01" name="SSDT7" size="wide">
          <T7Ticker />
        </Cell>

        <Cell id="charge" num="02" name="How Much?" size="medium">
          <ChargeWheel />
        </Cell>

        <Cell id="c1" num="03" name="Export" size="medium">
          <C1Export />
        </Cell>

        <Cell id="snake" num="04" name="Snake" size="wide">
          <SnakeGame />
        </Cell>

        <Cell id="net30" num="05" name="Net 30" size="medium">
          <Net30 />
        </Cell>

        <Cell id="reaction" num="06" name="Reaction Time" size="medium">
          <ReactionTest />
        </Cell>

        <Cell id="quiz" num="07" name="Quiz" size="wide">
          <PhotoQuiz />
        </Cell>

        <Cell id="8ball" num="08" name="8-Ball" size="medium">
          <Magic8Ball />
        </Cell>

        <Cell id="alive" num="09" name="Seconds Alive" size="medium">
          <AliveCounter />
        </Cell>

        <Cell id="gravity" num="10" name="Gravity" size="wide">
          <GravitySandbox />
        </Cell>
      </div>
    </div>
  )
}
