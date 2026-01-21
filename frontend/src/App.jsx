import React, { useState, useEffect } from 'react'
import { Layout, Calendar, Activity, MessageSquare, User, Zap, ChevronRight } from 'lucide-react'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-dark">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 glass border-r border-glass-border">
        <div className="mb-12">
          <Zap className="text-primary w-8 h-8 filter drop-shadow-[0_0_8px_var(--primary)]" />
        </div>
        <div className="flex flex-col gap-8 flex-1">
          <NavIcon icon={<Activity />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavIcon icon={<Calendar />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <NavIcon icon={<MessageSquare />} active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} />
        </div>
        <div>
          <NavIcon icon={<User />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-24 p-8 animate-in">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Hola, <span className="gradient-text">Atleta Leti</span>
            </h1>
            <p className="text-text-dim font-medium">Prepárate para tu próximo bloque de entrenamiento.</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-ghost smooth">Ver mejores esfuerzos</button>
            <button className="btn btn-primary smooth">Generar nueva semana</button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'coach' && <CoachChat />}
        {/* Other tabs components would go here */}
      </main>
    </div>
  )
}

function NavIcon({ icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer smooth ${active ? 'bg-primary text-black' : 'text-text-dim hover:text-white hover:bg-white/5'}`}
    >
      {React.cloneElement(icon, { size: 24 })}
    </div>
  )
}

function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <StatCard label="Carga Semanal" value="450" unit="TSS" span="col-span-3" />
      <StatCard label="Volumen" value="12.5" unit="h" span="col-span-3" />
      <StatCard label="FTP Actual" value="235" unit="W" span="col-span-3" />
      <StatCard label="Siguiente Carrera" value="15" unit="días" span="col-span-3" />

      <div className="col-span-8 glass p-6 h-96 flex flex-col justify-between">
        <h3 className="stat-label">Progreso de Carga</h3>
        {/* Placeholder for Chart */}
        <div className="flex-1 flex items-center justify-center border-t border-glass-border mt-4">
          <p className="text-text-dim">Gráfico de carga (Cargando datos...)</p>
        </div>
      </div>

      <div className="col-span-4 glass p-6 h-96">
        <h3 className="stat-label">Siguiente Sesión</h3>
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="text-primary" />
            </div>
            <div>
              <p className="font-bold">Umbral - 3x10min</p>
              <p className="text-sm text-text-dim">Ciclismo • 1h 15min</p>
            </div>
          </div>
          <p className="text-sm border-l-2 border-primary pl-4 py-2 bg-white/5 rounded-r">
            "Semana de construcción: estímulo de umbral para mejorar la potencia sostenida."
          </p>
          <button className="btn btn-ghost w-full justify-between mt-8">
            Ver detalles <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, span }) {
  return (
    <div className={`glass card-stat ${span}`}>
      <span className="stat-label">{label}</span>
      <div>
        <span className="stat-value">{value}</span>
        <span className="ml-2 text-text-dim font-bold">{unit}</span>
      </div>
    </div>
  )
}

function CoachChat() {
  return (
    <div className="glass max-w-2xl mx-auto h-[70vh] flex flex-col p-6">
      <div className="flex items-center gap-4 mb-6 border-b border-glass-border pb-4">
        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
          <MessageSquare className="text-secondary" />
        </div>
        <div>
          <p className="font-bold">Coach Leti</p>
          <p className="text-xs text-text-dim">En línea (DeepSeek V3.2)</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <ChatMessage sender="coach" text="¡Hola! Soy tu entrenador. ¿Cómo te sientes hoy para el entreno de umbral?" />
        <ChatMessage sender="athlete" text="Estoy algo cansada de ayer, ¿podemos ajustar?" />
      </div>
      <div className="mt-4 pt-4 border-t border-glass-border">
        <input
          type="text"
          placeholder="Habla con tu coach..."
          className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 outline-none focus:border-primary smooth"
        />
      </div>
    </div>
  )
}

function ChatMessage({ sender, text }) {
  return (
    <div className={`flex ${sender === 'athlete' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-3 rounded-2xl ${sender === 'athlete' ? 'bg-primary text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  )
}

export default App
