import '../../styles/extras.css'
import SnakeGame from '../../components/SnakeGame'
import BubbleWrap from '../../components/BubbleWrap'
import ReactionTest from '../../components/ReactionTest'
import PaletteGen from '../../components/PaletteGen'
import Magic8Ball from '../../components/Magic8Ball'
import GravitySandbox from '../../components/GravitySandbox'

export const metadata = { title: 'Extras — JKH Photo' }

export default function ExtrasPage() {
  return (
    <div className="extras-wrap">
      <div className="extras-header">
        <h1 className="extras-title">Extras</h1>
        <p className="extras-sub">Things that have nothing to do with photography.</p>
      </div>

      <section className="extras-section" id="snake">
        <div className="extras-section-label">
          <span className="extras-num">01</span>
          <span className="extras-name">Snake</span>
        </div>
        <SnakeGame />
      </section>

      <section className="extras-section" id="bubbles">
        <div className="extras-section-label">
          <span className="extras-num">02</span>
          <span className="extras-name">Bubble Wrap</span>
        </div>
        <BubbleWrap />
      </section>

      <section className="extras-section" id="reaction">
        <div className="extras-section-label">
          <span className="extras-num">03</span>
          <span className="extras-name">Reaction Time</span>
        </div>
        <ReactionTest />
      </section>

      <section className="extras-section" id="palette">
        <div className="extras-section-label">
          <span className="extras-num">04</span>
          <span className="extras-name">Palette Generator</span>
        </div>
        <PaletteGen />
      </section>

      <section className="extras-section" id="8ball">
        <div className="extras-section-label">
          <span className="extras-num">05</span>
          <span className="extras-name">Magic 8-Ball</span>
        </div>
        <Magic8Ball />
      </section>

      <section className="extras-section" id="gravity">
        <div className="extras-section-label">
          <span className="extras-num">06</span>
          <span className="extras-name">Gravity Sandbox</span>
        </div>
        <GravitySandbox />
      </section>
    </div>
  )
}
