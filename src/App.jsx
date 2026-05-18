import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Home,
  Menu,
  MessageCircle,
  Pill,
  Phone,
  Stethoscope,
} from 'lucide-react';

const sections = [
  {
    id: 'symptoms',
    title: 'Registrar sintomas',
    text: 'Anota molestias, intensidad y contexto para tu proxima consulta.',
    icon: ClipboardList,
    tone: 'red',
  },
  {
    id: 'meds',
    title: 'Medicacion',
    text: 'Revisa indicaciones frecuentes y marca tus tomas importantes.',
    icon: Pill,
  },
  {
    id: 'controls',
    title: 'Controles',
    text: 'Organiza presion, pulso y proximas citas cardiologicas.',
    icon: Activity,
  },
  {
    id: 'urgent',
    title: 'Senales de alerta',
    text: 'Identifica cuando corresponde buscar ayuda inmediata.',
    icon: AlertTriangle,
    tone: 'red',
  },
];

const alertSigns = [
  'Dolor opresivo en el pecho que dura mas de 10 minutos.',
  'Falta de aire intensa, desmayo o confusion.',
  'Palpitaciones sostenidas con mareo o debilidad marcada.',
  'Hinchazon brusca de piernas o aumento rapido de peso.',
];

export default function App() {
  const [view, setView] = useState('home');
  const [saved, setSaved] = useState(false);
  const [medications, setMedications] = useState([]);
  const [pressureRecords, setPressureRecords] = useState([]);
  const [form, setForm] = useState({
    symptom: '',
    intensity: 'Leve',
    pressureDate: '',
    pressureTime: '',
    systolic: '',
    diastolic: '',
    pulse: '',
    arm: 'Brazo izquierdo',
    position: 'Sentado',
    restTime: '5 minutos',
    pressureMoment: 'Manana',
    pressureSymptoms: '',
    pressureMeds: '',
    pressureNotes: '',
    medName: '',
    medSchedule: '',
    medEffects: '',
    notes: '',
  });

  const currentSection = useMemo(
    () => sections.find((section) => section.id === view),
    [view],
  );

  function updateField(event) {
    const { name, value } = event.target;
    setSaved(false);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function saveRecord(event) {
    event.preventDefault();
    setSaved(true);
  }

  function saveMedication(event) {
    event.preventDefault();
    if (!form.medName.trim() && !form.medSchedule.trim() && !form.medEffects.trim()) return;

    setMedications((current) => [
      {
        id: crypto.randomUUID(),
        name: form.medName.trim() || 'Medicacion sin nombre',
        schedule: form.medSchedule.trim() || 'Horario no indicado',
        effects: form.medEffects.trim(),
      },
      ...current,
    ]);
    setForm((current) => ({ ...current, medName: '', medSchedule: '', medEffects: '' }));
    setSaved(true);
  }

  function savePressureRecord(event) {
    event.preventDefault();
    if (!form.systolic.trim() && !form.diastolic.trim() && !form.pulse.trim()) return;

    setPressureRecords((current) => [
      {
        id: crypto.randomUUID(),
        date: form.pressureDate || new Date().toISOString().slice(0, 10),
        time: form.pressureTime || new Date().toTimeString().slice(0, 5),
        systolic: form.systolic.trim(),
        diastolic: form.diastolic.trim(),
        pulse: form.pulse.trim(),
        arm: form.arm,
        position: form.position,
        restTime: form.restTime,
        moment: form.pressureMoment,
        symptoms: form.pressureSymptoms.trim(),
        meds: form.pressureMeds.trim(),
        notes: form.pressureNotes.trim(),
      },
      ...current,
    ]);
    setForm((current) => ({
      ...current,
      pressureTime: '',
      systolic: '',
      diastolic: '',
      pulse: '',
      pressureSymptoms: '',
      pressureMeds: '',
      pressureNotes: '',
    }));
    setSaved(true);
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => setView('home')}>
            <span className="logo">
              <HeartPulse size={24} />
            </span>
            <span>
              <span className="brand-title">CardioMR</span>
              <span className="brand-sub">Dr. Giancarlo Muñoz Rennella · Cardiologo Intervencionista</span>
            </span>
          </button>
          <button className="icon-btn" type="button" onClick={() => setView('home')} aria-label="Ir al inicio">
            {view === 'home' ? <Menu size={22} /> : <Home size={22} />}
          </button>
        </div>
      </header>

      <main className="container">
        {view === 'home' ? (
          <HomeView onSelect={setView} />
        ) : (
          <SectionView
            section={currentSection}
            form={form}
            saved={saved}
            medications={medications}
            pressureRecords={pressureRecords}
            onBack={() => setView('home')}
            onChange={updateField}
            onSave={saveRecord}
            onSaveMedication={saveMedication}
            onSavePressureRecord={savePressureRecord}
          />
        )}
      </main>
    </>
  );
}

function HomeView({ onSelect }) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            <Stethoscope size={15} />
            App del paciente cardiologico
          </div>
          <h1>CardioMR</h1>
          <h2>Dr. Giancarlo Muñoz Rennella</h2>
          <h3>Cardiologo Intervencionista</h3>
          <p>
            Lleva un registro simple de sintomas, controles, medicacion y senales de alerta para compartir informacion
            mas ordenada con tu cardiologo.
          </p>
          <div className="hero-box">
            Esta app no reemplaza una consulta medica. Ante sintomas intensos o nuevos, busca atencion inmediata.
          </div>
        </div>
      </section>

      <section className="grid" aria-label="Funciones principales">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button className="card" type="button" key={section.id} onClick={() => onSelect(section.id)}>
              <span className={`card-icon ${section.tone || ''}`}>
                <Icon size={25} />
              </span>
              <span className="card-body">
                <span className="card-title">{section.title}</span>
                <span className="card-text">{section.text}</span>
              </span>
            </button>
          );
        })}
      </section>
    </>
  );
}

function SectionView({
  section,
  form,
  saved,
  medications,
  pressureRecords,
  onBack,
  onChange,
  onSave,
  onSaveMedication,
  onSavePressureRecord,
}) {
  const Icon = section?.icon || ClipboardList;

  return (
    <>
      <button className="btn light" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <section className="section-title">
        <p className="eyebrow">CardioMR</p>
        <h1>{section?.title}</h1>
        <p>{section?.text}</p>
      </section>

      {section?.id === 'symptoms' && (
        <form className="form-card" onSubmit={onSave}>
          <label className="field">
            <span>Sintoma principal</span>
            <input name="symptom" value={form.symptom} onChange={onChange} placeholder="Ej. dolor, falta de aire" />
          </label>
          <label className="field">
            <span>Intensidad</span>
            <select name="intensity" value={form.intensity} onChange={onChange}>
              <option>Leve</option>
              <option>Moderada</option>
              <option>Intensa</option>
            </select>
          </label>
          <label className="field">
            <span>Notas</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder="Cuando empezo, que estabas haciendo, si mejoro con reposo..."
            />
          </label>
          <button className="btn red full" type="submit">
            <CheckCircle2 size={18} />
            Guardar registro
          </button>
          {saved && <p className="success">Registro guardado en esta sesion.</p>}
        </form>
      )}

      {section?.id === 'meds' && (
        <>
          <form className="form-card" onSubmit={onSaveMedication}>
            <label className="field">
              <span>Medicacion que toma</span>
              <input
                name="medName"
                value={form.medName}
                onChange={onChange}
                placeholder="Ej. Losartan 50 mg"
              />
            </label>
            <label className="field">
              <span>Horario y dosis</span>
              <input
                name="medSchedule"
                value={form.medSchedule}
                onChange={onChange}
                placeholder="Ej. 1 comprimido a las 8:00"
              />
            </label>
            <label className="field">
              <span>Efectos secundarios que siente</span>
              <textarea
                name="medEffects"
                value={form.medEffects}
                onChange={onChange}
                placeholder="Ej. mareo, tos, cansancio, hinchazon..."
              />
            </label>
            <button className="btn primary full" type="submit">
              <Pill size={18} />
              Agregar medicacion
            </button>
            {saved && <p className="success">Medicacion agregada en esta sesion.</p>}
          </form>

          <div className="grid">
            {medications.length === 0 ? (
              <article className="med-card">
                <h3>Sin medicacion cargada todavia.</h3>
                <p>Agrega cada medicamento con su horario y cualquier efecto secundario que el paciente note.</p>
              </article>
            ) : (
              medications.map((medication) => (
                <article className="med-card" key={medication.id}>
                  <h3>{medication.name}</h3>
                  <p><strong>Horario:</strong> {medication.schedule}</p>
                  <p><strong>Efectos secundarios:</strong> {medication.effects || 'No registrados'}</p>
                </article>
              ))
            )}
          </div>

          <div className="warning">
            No suspender ni cambiar dosis sin indicacion medica. Llevar esta lista actualizada a cada control.
          </div>
        </>
      )}

      {section?.id === 'controls' && (
        <>
          <form className="form-card" onSubmit={onSavePressureRecord}>
            <div className="row two">
              <label className="field">
                <span>Fecha</span>
                <input type="date" name="pressureDate" value={form.pressureDate} onChange={onChange} />
              </label>
              <label className="field">
                <span>Hora</span>
                <input type="time" name="pressureTime" value={form.pressureTime} onChange={onChange} />
              </label>
            </div>

            <div className="row three">
              <label className="field">
                <span>Sistolica</span>
                <input name="systolic" inputMode="numeric" value={form.systolic} onChange={onChange} placeholder="120" />
              </label>
              <label className="field">
                <span>Diastolica</span>
                <input name="diastolic" inputMode="numeric" value={form.diastolic} onChange={onChange} placeholder="80" />
              </label>
              <label className="field">
                <span>Pulso</span>
                <input name="pulse" inputMode="numeric" value={form.pulse} onChange={onChange} placeholder="72" />
              </label>
            </div>

            <div className="row two">
              <label className="field">
                <span>Momento del dia</span>
                <select name="pressureMoment" value={form.pressureMoment} onChange={onChange}>
                  <option>Manana</option>
                  <option>Tarde</option>
                  <option>Noche</option>
                  <option>Madrugada</option>
                </select>
              </label>
              <label className="field">
                <span>Brazo</span>
                <select name="arm" value={form.arm} onChange={onChange}>
                  <option>Brazo izquierdo</option>
                  <option>Brazo derecho</option>
                  <option>Ambos brazos</option>
                </select>
              </label>
            </div>

            <div className="row two">
              <label className="field">
                <span>Posicion</span>
                <select name="position" value={form.position} onChange={onChange}>
                  <option>Sentado</option>
                  <option>Acostado</option>
                  <option>De pie</option>
                </select>
              </label>
              <label className="field">
                <span>Reposo previo</span>
                <select name="restTime" value={form.restTime} onChange={onChange}>
                  <option>Sin reposo</option>
                  <option>5 minutos</option>
                  <option>10 minutos</option>
                  <option>Mas de 10 minutos</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Sintomas al momento de medir</span>
              <textarea
                name="pressureSymptoms"
                value={form.pressureSymptoms}
                onChange={onChange}
                placeholder="Ej. dolor de cabeza, mareo, palpitaciones, falta de aire..."
              />
            </label>
            <label className="field">
              <span>Medicacion tomada antes de la medicion</span>
              <input
                name="pressureMeds"
                value={form.pressureMeds}
                onChange={onChange}
                placeholder="Ej. Losartan 8:00, carvedilol 20:00"
              />
            </label>
            <label className="field">
              <span>Observaciones</span>
              <textarea
                name="pressureNotes"
                value={form.pressureNotes}
                onChange={onChange}
                placeholder="Actividad previa, estres, cafe, comida, ejercicio o cualquier dato relevante."
              />
            </label>

            <button className="btn primary full" type="submit">
              <CalendarDays size={18} />
              Guardar medicion de presion
            </button>
            {saved && <p className="success">Medicion guardada en esta sesion.</p>}
          </form>

          <PressureRecords records={pressureRecords} />
        </>
      )}

      {section?.id === 'urgent' && (
        <div className="grid">
          <div className="alert-box">
            <Icon size={28} />
            <h2>Busca ayuda de emergencia si aparece una senal intensa o repentina.</h2>
          </div>
          {alertSigns.map((text) => (
            <div className="item" key={text}>
              <AlertTriangle size={22} color="#b91c1c" />
              <p>{text}</p>
            </div>
          ))}
          <a className="btn red full" href="tel:911">
            <Phone size={18} />
            Llamar emergencias
          </a>
          <a className="btn light full" href="https://wa.me/" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Abrir WhatsApp
          </a>
        </div>
      )}
    </>
  );
}

function PressureRecords({ records }) {
  const latest = records[0];
  const expectedFor15Days = 45;

  return (
    <section className="grid">
      <div className="summary-grid">
        <article className="stat-card">
          <span>Mediciones</span>
          <strong>{records.length}</strong>
          <p>de {expectedFor15Days} si es cada 8 horas por 15 dias</p>
        </article>
        <article className="stat-card">
          <span>Ultima presion</span>
          <strong>{latest ? `${latest.systolic || '-'} / ${latest.diastolic || '-'}` : '-- / --'}</strong>
          <p>{latest ? `${latest.date} ${latest.time}` : 'Sin registros todavia'}</p>
        </article>
      </div>

      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin controles cargados todavia.</h3>
          <p>
            Cada medicion guardada va a aparecer aca. Para controles cada 8 horas por 15 dias, la lista puede crecer
            hasta 45 registros sin cambiar de pantalla.
          </p>
        </article>
      ) : (
        records.map((record, index) => (
          <article className="control-card" key={record.id}>
            <div className="control-card-head">
              <div>
                <span>Medicion {records.length - index}</span>
                <h3>{record.systolic || '-'} / {record.diastolic || '-'} mmHg</h3>
              </div>
              <strong>{record.pulse || '-'} lpm</strong>
            </div>
            <div className="control-meta">
              <span>{record.date}</span>
              <span>{record.time}</span>
              <span>{record.moment}</span>
              <span>{record.arm}</span>
              <span>{record.position}</span>
              <span>Reposo: {record.restTime}</span>
            </div>
            <p><strong>Sintomas:</strong> {record.symptoms || 'No registrados'}</p>
            <p><strong>Medicacion previa:</strong> {record.meds || 'No registrada'}</p>
            <p><strong>Observaciones:</strong> {record.notes || 'Sin observaciones'}</p>
          </article>
        ))
      )}

      <div className="warning">
        Si una medicion sale muy alta o se acompana de dolor de pecho, falta de aire, deficit neurologico, desmayo o
        sintomas intensos, no esperar al proximo control.
      </div>
    </section>
  );
}
