import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  HeartPulse,
  Home,
  MessageCircle,
  Pill,
  Phone,
  Stethoscope,
  X,
} from 'lucide-react';

const sections = [
  {
    id: 'symptoms',
    title: 'Registrar síntomas',
    text: 'Anota molestias, intensidad y contexto para tu próxima consulta.',
    icon: ClipboardList,
    tone: 'red',
  },
  {
    id: 'meds',
    title: 'Medicación',
    text: 'Revisa indicaciones frecuentes y marca tus tomas importantes.',
    icon: Pill,
  },
  {
    id: 'controls',
    title: 'Controles',
    text: 'Organiza presión, pulso y próximas citas cardiológicas.',
    icon: Activity,
  },
  {
    id: 'urgent',
    title: 'Señales de alerta',
    text: 'Identifica cuándo corresponde buscar ayuda inmediata.',
    icon: AlertTriangle,
    tone: 'red',
  },
];

const alertSigns = [
  'Dolor opresivo en el pecho que dura más de 10 minutos.',
  'Falta de aire intensa, desmayo o confusión.',
  'Palpitaciones sostenidas con mareo o debilidad marcada.',
  'Registro de presión arterial sistólica mayor a 180 mmHg, especialmente si se acompaña de dolor de pecho, falta de aire, cefalea intensa, visión borrosa o síntomas neurológicos.',
];

const emptyMedicationFields = { medName: '', medSchedule: '', medEffects: '' };
const storageKey = 'cardio-gm-patient-records';

function loadSavedRecords() {
  try {
    const savedRecords = localStorage.getItem(storageKey);
    if (!savedRecords) return {};
    return JSON.parse(savedRecords);
  } catch {
    return {};
  }
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export default function App() {
  const [view, setView] = useState('home');
  const [saved, setSaved] = useState(false);
  const [symptomRecords, setSymptomRecords] = useState(() => loadSavedRecords().symptomRecords || []);
  const [editingSymptomId, setEditingSymptomId] = useState(null);
  const [medications, setMedications] = useState(() => loadSavedRecords().medications || []);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [pressureRecords, setPressureRecords] = useState(() => loadSavedRecords().pressureRecords || []);
  const [glucoseRecords, setGlucoseRecords] = useState(() => loadSavedRecords().glucoseRecords || []);
  const [bmiRecords, setBmiRecords] = useState(() => loadSavedRecords().bmiRecords || []);
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
    pressureMoment: 'Mañana',
    pressureMeds: '',
    pressureNotes: '',
    glucoseValue: '',
    glucoseType: 'Ayunas',
    glucoseNotes: '',
    weight: '',
    height: '',
    medName: '',
    medSchedule: '',
    medEffects: '',
    notes: '',
  });

  const currentSection = useMemo(
    () => sections.find((section) => section.id === view),
    [view],
  );

  useEffect(() => {
    window.history.replaceState({ view: 'home' }, '', window.location.pathname);

    function handleBackButton(event) {
      setView(event.state?.view || 'home');
    }

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ symptomRecords, medications, pressureRecords, glucoseRecords, bmiRecords }),
    );
  }, [symptomRecords, medications, pressureRecords, glucoseRecords, bmiRecords]);

  function navigateTo(nextView) {
    setSaved(false);
    setView(nextView);
    window.history.pushState({ view: nextView }, '', window.location.pathname);
  }

  function navigateHome() {
    setSaved(false);
    setView('home');
    window.history.replaceState({ view: 'home' }, '', window.location.pathname);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setSaved(false);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function saveSymptom(event) {
    event.preventDefault();
    if (!form.symptom.trim() && !form.notes.trim()) return;

    const symptomRecord = {
      id: editingSymptomId || crypto.randomUUID(),
      symptom: form.symptom.trim() || 'Síntoma sin especificar',
      intensity: form.intensity,
      notes: form.notes.trim(),
      date: editingSymptomId ? undefined : new Date().toISOString().slice(0, 10),
      time: editingSymptomId ? undefined : new Date().toTimeString().slice(0, 5),
    };

    setSymptomRecords((current) => (
      editingSymptomId
        ? current.map((item) => (
            item.id === editingSymptomId
              ? { ...item, ...symptomRecord, date: item.date, time: item.time }
              : item
          ))
        : [symptomRecord, ...current]
    ));
    setForm((current) => ({ ...current, symptom: '', intensity: 'Leve', notes: '' }));
    setEditingSymptomId(null);
    setSaved(true);
  }

  function editSymptom(record) {
    setSaved(false);
    setEditingSymptomId(record.id);
    setForm((current) => ({
      ...current,
      symptom: record.symptom,
      intensity: record.intensity,
      notes: record.notes,
    }));
  }

  function cancelSymptomEdit() {
    setSaved(false);
    setEditingSymptomId(null);
    setForm((current) => ({ ...current, symptom: '', intensity: 'Leve', notes: '' }));
  }

  function deleteSymptom(recordId) {
    setSymptomRecords((current) => current.filter((item) => item.id !== recordId));
    if (editingSymptomId === recordId) {
      cancelSymptomEdit();
    }
    setSaved(false);
  }

  function saveMedication(event) {
    event.preventDefault();
    if (!form.medName.trim() && !form.medSchedule.trim() && !form.medEffects.trim()) return;

    const medication = {
      id: editingMedicationId || crypto.randomUUID(),
      name: form.medName.trim() || 'Medicación sin nombre',
      schedule: form.medSchedule.trim() || 'Horario no indicado',
      effects: form.medEffects.trim(),
    };

    setMedications((current) => (
      editingMedicationId
        ? current.map((item) => (item.id === editingMedicationId ? medication : item))
        : [medication, ...current]
    ));
    setForm((current) => ({ ...current, ...emptyMedicationFields }));
    setEditingMedicationId(null);
    setSaved(true);
  }

  function editMedication(medication) {
    setSaved(false);
    setEditingMedicationId(medication.id);
    setForm((current) => ({
      ...current,
      medName: medication.name,
      medSchedule: medication.schedule,
      medEffects: medication.effects,
    }));
  }

  function cancelMedicationEdit() {
    setSaved(false);
    setEditingMedicationId(null);
    setForm((current) => ({ ...current, ...emptyMedicationFields }));
  }

  function deleteMedication(medicationId) {
    setMedications((current) => current.filter((item) => item.id !== medicationId));
    if (editingMedicationId === medicationId) {
      cancelMedicationEdit();
    }
    setSaved(false);
  }

  function savePressureRecord(event) {
    event.preventDefault();
    const hasPressure = form.systolic.trim() || form.diastolic.trim() || form.pulse.trim();
    const hasGlucose = form.glucoseValue.trim();
    const hasBmi = form.weight.trim() && form.height.trim();
    if (!hasPressure && !hasGlucose && !hasBmi) return;

    const date = form.pressureDate || new Date().toISOString().slice(0, 10);
    const time = form.pressureTime || new Date().toTimeString().slice(0, 5);

    if (hasPressure) {
      setPressureRecords((current) => [
        {
          id: crypto.randomUUID(),
          date,
          time,
          systolic: form.systolic.trim(),
          diastolic: form.diastolic.trim(),
          pulse: form.pulse.trim(),
          arm: form.arm,
          position: form.position,
          restTime: form.restTime,
          moment: form.pressureMoment,
          meds: form.pressureMeds.trim(),
          notes: form.pressureNotes.trim(),
        },
        ...current,
      ]);
    }

    if (hasGlucose) {
      setGlucoseRecords((current) => [
        {
          id: crypto.randomUUID(),
          date,
          time,
          value: form.glucoseValue.trim(),
          type: form.glucoseType,
          notes: form.glucoseNotes.trim(),
        },
        ...current,
      ]);
    }

    if (hasBmi) {
      const weight = Number(String(form.weight).replace(',', '.'));
      const heightInput = Number(String(form.height).replace(',', '.'));
      const heightInMeters = heightInput > 3 ? heightInput / 100 : heightInput;
      const bmi = heightInMeters > 0 ? weight / (heightInMeters * heightInMeters) : 0;

      if (weight > 0 && bmi > 0) {
        setBmiRecords((current) => [
          {
            id: crypto.randomUUID(),
            date,
            time,
            weight: form.weight.trim(),
            height: form.height.trim(),
            bmi: bmi.toFixed(1),
            category: getBmiCategory(bmi),
          },
          ...current,
        ]);
      }
    }

    setForm((current) => ({
      ...current,
      pressureTime: '',
      systolic: '',
      diastolic: '',
      pulse: '',
      pressureMeds: '',
      pressureNotes: '',
      glucoseValue: '',
      glucoseType: 'Ayunas',
      glucoseNotes: '',
      weight: '',
      height: '',
    }));
    setSaved(true);
  }

  function deletePressureRecord(recordId) {
    setPressureRecords((current) => current.filter((record) => record.id !== recordId));
    setSaved(false);
  }

  function deleteBmiRecord(recordId) {
    setBmiRecords((current) => current.filter((record) => record.id !== recordId));
    setSaved(false);
  }

  function printPatientReport() {
    window.print();
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={navigateHome}>
            <span className="logo">
              <HeartPulse size={24} />
            </span>
            <span>
              <span className="brand-title">Cardio GM</span>
              <span className="brand-sub">Dr. Giancarlo Muñoz Rennella · Cardiólogo Intervencionista</span>
            </span>
          </button>
          {view !== 'home' && (
            <button className="icon-btn" type="button" onClick={navigateHome} aria-label="Ir al inicio">
              <Home size={22} />
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {view === 'home' ? (
          <HomeView onSelect={navigateTo} />
        ) : (
          <SectionView
            section={currentSection}
            form={form}
            saved={saved}
            symptomRecords={symptomRecords}
            editingSymptomId={editingSymptomId}
            medications={medications}
            editingMedicationId={editingMedicationId}
            pressureRecords={pressureRecords}
            glucoseRecords={glucoseRecords}
            bmiRecords={bmiRecords}
            onBack={navigateHome}
            onChange={updateField}
            onSaveSymptom={saveSymptom}
            onEditSymptom={editSymptom}
            onDeleteSymptom={deleteSymptom}
            onCancelSymptomEdit={cancelSymptomEdit}
            onSaveMedication={saveMedication}
            onEditMedication={editMedication}
            onDeleteMedication={deleteMedication}
            onCancelMedicationEdit={cancelMedicationEdit}
            onSavePressureRecord={savePressureRecord}
            onDeletePressureRecord={deletePressureRecord}
            onDeleteBmiRecord={deleteBmiRecord}
            onPrintPatientReport={printPatientReport}
          />
        )}
      </main>
      <PatientReport
        medications={medications}
        pressureRecords={pressureRecords}
        glucoseRecords={glucoseRecords}
        bmiRecords={bmiRecords}
      />
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
            App del paciente cardiológico
          </div>
          <div className="hero-brand-row">
            <div>
              <h1>Cardio GM</h1>
            </div>
            <CardioGmLogo />
          </div>
          <h2>Dr. Giancarlo Muñoz Rennella</h2>
          <h3>Cardiólogo Intervencionista</h3>
          <p>
            Lleva un registro simple de síntomas, controles, medicación y señales de alerta para compartir información
            más ordenada con tu cardiólogo.
          </p>
          <div className="hero-box">
            Esta app no reemplaza una consulta médica. Ante síntomas intensos o nuevos, busca atención inmediata.
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

function CardioGmLogo() {
  return (
    <img className="hero-logo" src="/cardio-gm-logo.png" alt="Logo Cardio GM" />
  );
}

function SectionView({
  section,
  form,
  saved,
  symptomRecords,
  editingSymptomId,
  medications,
  editingMedicationId,
  pressureRecords,
  glucoseRecords,
  bmiRecords,
  onBack,
  onChange,
  onSaveSymptom,
  onEditSymptom,
  onDeleteSymptom,
  onCancelSymptomEdit,
  onSaveMedication,
  onEditMedication,
  onDeleteMedication,
  onCancelMedicationEdit,
  onSavePressureRecord,
  onDeletePressureRecord,
  onDeleteBmiRecord,
  onPrintPatientReport,
}) {
  const Icon = section?.icon || ClipboardList;

  return (
    <>
      <button className="btn light" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <section className="section-title">
        <p className="eyebrow">Cardio GM</p>
        <h1>{section?.title}</h1>
        <p>{section?.text}</p>
      </section>

      {section?.id === 'symptoms' && (
        <>
          <form className="form-card" onSubmit={onSaveSymptom}>
            <label className="field">
              <span>Síntoma principal</span>
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
                placeholder="Cuándo empezó, qué estabas haciendo, si mejoró con reposo..."
              />
            </label>
            <button className="btn red full" type="submit">
              <CheckCircle2 size={18} />
              {editingSymptomId ? 'Guardar cambios' : 'Guardar síntoma'}
            </button>
            {editingSymptomId && (
              <button className="btn light full" type="button" onClick={onCancelSymptomEdit}>
                <X size={18} />
                Cancelar edición
              </button>
            )}
            {saved && <p className="success">Síntoma guardado en esta sesión.</p>}
          </form>
          <SymptomRecords records={symptomRecords} onEdit={onEditSymptom} onDelete={onDeleteSymptom} />
        </>
      )}

      {section?.id === 'meds' && (
        <>
          <form className="form-card" onSubmit={onSaveMedication}>
            <label className="field">
              <span>Medicación que toma</span>
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
                placeholder="Ej. mareo, tos, cansancio, hinchazón..."
              />
            </label>
            <button className="btn primary full" type="submit">
              <Pill size={18} />
              {editingMedicationId ? 'Guardar cambios' : 'Agregar medicación'}
            </button>
            {editingMedicationId && (
              <button className="btn light full" type="button" onClick={onCancelMedicationEdit}>
                <X size={18} />
                Cancelar edición
              </button>
            )}
            {saved && (
              <p className="success">
                {editingMedicationId ? 'Cambios guardados.' : 'Medicación guardada en esta sesión.'}
              </p>
            )}
          </form>

          <div className="grid">
            {medications.length === 0 ? (
              <article className="med-card">
                <h3>Sin medicación cargada todavía.</h3>
                <p>Agrega cada medicamento con su horario y cualquier efecto secundario que el paciente note.</p>
              </article>
            ) : (
              medications.map((medication) => (
                <article className="med-card" key={medication.id}>
                  <h3>{medication.name}</h3>
                  <p><strong>Horario:</strong> {medication.schedule}</p>
                  <p><strong>Efectos secundarios:</strong> {medication.effects || 'No registrados'}</p>
                  <button className="btn soft full card-action" type="button" onClick={() => onEditMedication(medication)}>
                    <Edit3 size={18} />
                    Editar medicación
                  </button>
                  <button className="btn light full card-action" type="button" onClick={() => onDeleteMedication(medication.id)}>
                    <X size={18} />
                    Eliminar medicación
                  </button>
                </article>
              ))
            )}
          </div>

          <div className="warning">
            No suspender ni cambiar dosis sin indicación médica. Llevar esta lista actualizada a cada control.
          </div>

          <button className="btn red full" type="button" onClick={onPrintPatientReport}>
            <ClipboardList size={18} />
            Generar PDF con medicación, presión y glucosa
          </button>
        </>
      )}

      {section?.id === 'controls' && (
        <>
          <form className="form-card" onSubmit={onSavePressureRecord}>
            <div className="row three">
              <label className="field">
                <span>Sistólica</span>
                <input name="systolic" inputMode="numeric" value={form.systolic} onChange={onChange} placeholder="120" />
              </label>
              <label className="field">
                <span>Diastólica</span>
                <input name="diastolic" inputMode="numeric" value={form.diastolic} onChange={onChange} placeholder="80" />
              </label>
              <label className="field">
                <span>Pulso</span>
                <input name="pulse" inputMode="numeric" value={form.pulse} onChange={onChange} placeholder="72" />
              </label>
            </div>

            <div className="row two">
              <label className="field">
                <span>Momento del día</span>
                <select name="pressureMoment" value={form.pressureMoment} onChange={onChange}>
                  <option>Mañana</option>
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
                <span>Posición</span>
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
                  <option>Más de 10 minutos</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Medicación tomada antes de la medición</span>
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
                placeholder="Actividad previa, estrés, café, comida, ejercicio o cualquier dato relevante."
              />
            </label>

            <div className="row two">
              <label className="field">
                <span>Glucosa</span>
                <input
                  name="glucoseValue"
                  inputMode="numeric"
                  value={form.glucoseValue}
                  onChange={onChange}
                  placeholder="Ej. 105 mg/dL"
                />
              </label>
              <label className="field">
                <span>Tipo de medición</span>
                <select name="glucoseType" value={form.glucoseType} onChange={onChange}>
                  <option>Ayunas</option>
                  <option>Al azar</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Notas de glucosa</span>
              <textarea
                name="glucoseNotes"
                value={form.glucoseNotes}
                onChange={onChange}
                placeholder="Ej. antes de desayunar, después de comer, síntomas asociados o medicación antidiabética."
              />
            </label>

            <div className="row two">
              <label className="field">
                <span>Peso</span>
                <input
                  name="weight"
                  inputMode="decimal"
                  value={form.weight}
                  onChange={onChange}
                  placeholder="Ej. 78 kg"
                />
              </label>
              <label className="field">
                <span>Talla</span>
                <input
                  name="height"
                  inputMode="decimal"
                  value={form.height}
                  onChange={onChange}
                  placeholder="Ej. 1.72 m o 172 cm"
                />
              </label>
            </div>

            <button className="btn primary full" type="submit">
              <CalendarDays size={18} />
              Guardar control
            </button>
            {saved && <p className="success">Control guardado en esta sesión.</p>}
          </form>

          <PressureRecords records={pressureRecords} onDelete={onDeletePressureRecord} />
          <GlucoseRecords records={glucoseRecords} />
          <BmiRecords records={bmiRecords} onDelete={onDeleteBmiRecord} />

          <button className="btn red full" type="button" onClick={onPrintPatientReport}>
            <ClipboardList size={18} />
            Generar PDF con medicación, presión, glucosa e IMC
          </button>
        </>
      )}

      {section?.id === 'urgent' && (
        <div className="grid">
          <div className="alert-box">
            <Icon size={28} />
            <h2>Busca ayuda de emergencia si aparece una señal intensa o repentina.</h2>
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
          <a className="btn whatsapp full" href="https://wa.me/593986426990" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Escribir al consultorio por WhatsApp
          </a>
        </div>
      )}
    </>
  );
}

function PatientReport({ medications, pressureRecords, glucoseRecords, bmiRecords }) {
  const generatedAt = new Date().toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="print-report" aria-label="Resumen para imprimir">
      <header>
        <div>
          <h1>Cardio GM</h1>
          <h2>Dr. Giancarlo Muñoz Rennella</h2>
          <p>Cardiólogo Intervencionista</p>
          <p>Resumen generado: {generatedAt}</p>
        </div>
        <img src="/cardio-gm-logo.png" alt="Logo Cardio GM" />
      </header>

      <article>
        <h2>Medicación actual</h2>
        {medications.length === 0 ? (
          <p>Sin medicación registrada.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicación</th>
                <th>Horario y dosis</th>
                <th>Efectos secundarios</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication) => (
                <tr key={medication.id}>
                  <td>{medication.name}</td>
                  <td>{medication.schedule}</td>
                  <td>{medication.effects || 'No registrados'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>

      <article>
        <h2>Registros de presión arterial</h2>
        {pressureRecords.length === 0 ? (
          <p>Sin controles de presión registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Presión</th>
                <th>Pulso</th>
                <th>Contexto</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {pressureRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.systolic || '-'} / {record.diastolic || '-'} mmHg</td>
                  <td>{record.pulse || '-'} lpm</td>
                  <td>{record.moment}, {record.arm}, {record.position}, reposo: {record.restTime}</td>
                  <td>
                    Medicación previa: {record.meds || 'No registrada'}.
                    Observaciones: {record.notes || 'Sin observaciones'}.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>

      <article>
        <h2>Registros de glucosa</h2>
        {glucoseRecords.length === 0 ? (
          <p>Sin controles de glucosa registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Glucosa</th>
                <th>Tipo</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {glucoseRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.value} mg/dL</td>
                  <td>{record.type}</td>
                  <td>{record.notes || 'Sin notas'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>

      <article>
        <h2>Registros de IMC</h2>
        {bmiRecords.length === 0 ? (
          <p>Sin controles de IMC registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Peso</th>
                <th>Talla</th>
                <th>IMC</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {bmiRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.weight} kg</td>
                  <td>{record.height}</td>
                  <td>{record.bmi}</td>
                  <td>{record.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </section>
  );
}

function SymptomRecords({ records, onEdit, onDelete }) {
  return (
    <section className="grid">
      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin síntomas cargados todavía.</h3>
          <p>Los síntomas guardados aparecerán acá para revisar la evolución antes de la consulta.</p>
        </article>
      ) : (
        records.map((record, index) => (
          <article className="med-card" key={record.id}>
            <div className="control-card-head">
              <div>
                <span>Registro {records.length - index}</span>
                <h3>{record.symptom}</h3>
              </div>
              <strong>{record.intensity}</strong>
            </div>
            <div className="control-meta">
              <span>{record.date}</span>
              <span>{record.time}</span>
            </div>
            <p><strong>Notas:</strong> {record.notes || 'Sin notas'}</p>
            <button className="btn soft full card-action" type="button" onClick={() => onEdit(record)}>
              <Edit3 size={18} />
              Editar síntoma
            </button>
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar síntoma
            </button>
          </article>
        ))
      )}
    </section>
  );
}

function GlucoseRecords({ records }) {
  const latest = records[0];

  return (
    <section className="grid">
      <div className="summary-grid">
        <article className="stat-card">
          <span>Glucosas</span>
          <strong>{records.length}</strong>
          <p>controles registrados</p>
        </article>
        <article className="stat-card">
          <span>Última glucosa</span>
          <strong>{latest ? `${latest.value} mg/dL` : '--'}</strong>
          <p>{latest ? `${latest.type} · ${latest.date} ${latest.time}` : 'Sin registros todavía'}</p>
        </article>
      </div>

      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin glucosas cargadas todavía.</h3>
          <p>Si el paciente es diabético, puede registrar glucosa en ayunas o al azar junto con sus controles.</p>
        </article>
      ) : (
        records.map((record, index) => (
          <article className="control-card" key={record.id}>
            <div className="control-card-head">
              <div>
                <span>Glucosa {records.length - index}</span>
                <h3>{record.value} mg/dL</h3>
              </div>
              <strong>{record.type}</strong>
            </div>
            <div className="control-meta">
              <span>{record.date}</span>
              <span>{record.time}</span>
            </div>
            <p><strong>Notas:</strong> {record.notes || 'Sin notas'}</p>
          </article>
        ))
      )}
    </section>
  );
}

function BmiRecords({ records, onDelete }) {
  const latest = records[0];

  return (
    <section className="grid">
      <div className="summary-grid">
        <article className="stat-card">
          <span>IMC</span>
          <strong>{records.length}</strong>
          <p>controles registrados</p>
        </article>
        <article className="stat-card">
          <span>Último IMC</span>
          <strong>{latest ? latest.bmi : '--'}</strong>
          <p>{latest ? `${latest.category} · ${latest.date} ${latest.time}` : 'Sin registros todavía'}</p>
        </article>
      </div>

      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin IMC cargado todavía.</h3>
          <p>Ingresa peso y talla para calcular el índice de masa corporal y seguirlo en controles.</p>
        </article>
      ) : (
        records.map((record, index) => (
          <article className="control-card" key={record.id}>
            <div className="control-card-head">
              <div>
                <span>IMC {records.length - index}</span>
                <h3>{record.bmi}</h3>
              </div>
              <strong>{record.category}</strong>
            </div>
            <div className="control-meta">
              <span>{record.date}</span>
              <span>{record.time}</span>
              <span>Peso: {record.weight} kg</span>
              <span>Talla: {record.height}</span>
            </div>
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar IMC
            </button>
          </article>
        ))
      )}
    </section>
  );
}

function PressureRecords({ records, onDelete }) {
  const latest = records[0];
  const expectedFor15Days = 45;

  return (
    <section className="grid">
      <div className="summary-grid">
        <article className="stat-card">
          <span>Mediciones</span>
          <strong>{records.length}</strong>
          <p>de {expectedFor15Days} si es cada 8 horas por 15 días</p>
        </article>
        <article className="stat-card">
          <span>Última presión</span>
          <strong>{latest ? `${latest.systolic || '-'} / ${latest.diastolic || '-'}` : '-- / --'}</strong>
          <p>{latest ? `${latest.date} ${latest.time}` : 'Sin registros todavía'}</p>
        </article>
      </div>

      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin controles cargados todavía.</h3>
          <p>
            Cada medición guardada va a aparecer acá. Para controles cada 8 horas por 15 días, la lista puede crecer
            hasta 45 registros sin cambiar de pantalla.
          </p>
        </article>
      ) : (
        records.map((record, index) => (
          <article className="control-card" key={record.id}>
            <div className="control-card-head">
              <div>
                <span>Medición {records.length - index}</span>
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
            <p><strong>Medicación previa:</strong> {record.meds || 'No registrada'}</p>
            <p><strong>Observaciones:</strong> {record.notes || 'Sin observaciones'}</p>
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar medición
            </button>
          </article>
        ))
      )}

      <div className="warning">
        Si una medición sale muy alta o se acompaña de dolor de pecho, falta de aire, déficit neurológico, desmayo o
        síntomas intensos, no esperar al próximo control.
      </div>
    </section>
  );
}
