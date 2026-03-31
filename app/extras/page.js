import '../../styles/extras.css'
import SnakeGame from '../../components/SnakeGame'

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
    </div>
  )
}
