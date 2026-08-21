import Sidebar from '../components/Sidebar.jsx'
import s from './Home.module.css'

export default function Home() {
  return (
    <div className={s.layout}>
      <Sidebar />
      <div className={s.coluna}>
        <h1>Pesquisa de Clima</h1>
      </div>
    </div>
  )
}
