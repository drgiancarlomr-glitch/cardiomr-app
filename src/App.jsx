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
    tone: 'symptoms',
  },
  {
    id: 'meds',
    title: 'Medicación',
    text: 'Revisa indicaciones frecuentes y marca tus tomas importantes.',
    icon: Pill,
    tone: 'meds',
  },
  {
    id: 'controls',
    title: 'Controles',
    text: 'Organiza presión, pulso y próximas citas cardiológicas.',
    icon: Activity,
    tone: 'controls',
  },
  {
    id: 'care',
    title: 'Cuidados y turnos',
    text: 'Guías de cuidado, próximo control, Google Calendar y WhatsApp para turnos.',
    icon: Stethoscope,
    tone: 'care',
  },
  {
    id: 'urgent',
    title: 'Señales de alerta',
    text: 'Identifica cuándo corresponde buscar ayuda inmediata.',
    icon: AlertTriangle,
    tone: 'urgent',
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
const consultorioWhatsapp = '593986426990';

const careGuides = [
  {
    title: 'Hipertensión arterial',
    summary: 'Cuidar la presión todos los días: menos sal, medicación ordenada, registros y actividad indicada.',
    care: ['Tomar la medicación como fue indicada.', 'Medir y anotar la presión si el doctor lo solicita.', 'Evitar antiinflamatorios o descongestionantes sin consultar.', 'Consultar si hay presión sistólica mayor a 180 mmHg o síntomas de alarma.'],
    yes: ['Verduras, frutas enteras, menestras, pescado, pollo sin piel, huevo.', 'Arroz, verde, yuca o papa en porción moderada.', 'Preparaciones al horno, a la plancha, sudadas o al vapor.'],
    no: ['Embutidos, cubitos, sopas instantáneas, snacks salados.', 'Frituras frecuentes, comida rápida, exceso de queso salado.', 'Agregar sal en la mesa.'],
    meals: ['Desayuno: bolón pequeño asado o tortilla de verde con huevo.', 'Almuerzo: pescado al vapor con arroz moderado, menestra y ensalada.', 'Merienda: caldo de pollo casero bajo en sal o seco de pollo sin piel.'],
    followUp: 'Control habitual cada 3 meses o antes según indicación.',
  },
  {
    title: 'Diabetes',
    summary: 'Ordenar carbohidratos, evitar bebidas azucaradas y registrar glucosa si fue indicado.',
    care: ['No suspender medicación o insulina sin indicación.', 'Revisar pies todos los días.', 'Llevar registros de glucosa al control.', 'Consultar si hay glucosas muy altas, hipoglucemias o síntomas llamativos.'],
    yes: ['Medio plato verduras, un cuarto proteína y un cuarto carbohidrato.', 'Proteínas magras, menestras, vegetales y frutas enteras.', 'Carbohidratos medidos: verde, yuca, papa, arroz, mote o avena.'],
    no: ['Gaseosas, jugos, postres y pan dulce frecuente.', 'Combinar arroz + papa + yuca + maduro en porciones grandes.', 'Saltarse comidas si usa medicación que puede bajar glucosa.'],
    meals: ['Desayuno: huevo con tomate/cebolla, verde pequeño y café sin azúcar.', 'Almuerzo: pollo o pescado, ensalada grande, menestra y poco arroz.', 'Merienda: sopa de verduras con pollo o atún con ensalada.'],
    followUp: 'Control habitual cada 3 meses o según indicación.',
  },
  {
    title: 'Post stent coronario',
    summary: 'Proteger el stent, no suspender antiagregantes y retomar actividad progresivamente.',
    care: ['No suspender aspirina, clopidogrel, ticagrelor u otro antiagregante sin autorización.', 'Evitar esfuerzos intensos los primeros días.', 'Controlar presión, glucosa y colesterol si corresponde.', 'Consultar urgente ante dolor de pecho, falta de aire intensa, desmayo o sangrado importante.'],
    yes: ['Comida casera baja en sal, verduras diarias, pescado, pollo sin piel, menestras.', 'Grasas saludables en porción: aguacate, aceite vegetal, frutos secos sin sal.', 'Actividad física progresiva cuando el cardiólogo lo autorice.'],
    no: ['Fumar o suspender medicación.', 'Frituras frecuentes y comidas muy grasosas.', 'Ignorar dolor de pecho nuevo o similar al previo.'],
    meals: ['Desayuno: avena sin azúcar con fruta o huevo con verde asado.', 'Almuerzo: pescado, ensalada, menestra y arroz moderado.', 'Merienda: pollo al horno con verduras o sopa casera baja en sal.'],
    followUp: 'Control a las pocas semanas y luego cada 3 meses o según indicación.',
  },
  {
    title: 'Acceso radial',
    summary: 'Cuidados del sitio de punción en muñeca luego del procedimiento.',
    care: ['Mantener el sitio limpio y seco según indicación.', 'Evitar cargar peso o hacer fuerza con esa mano por 24-48 h o según indicación.', 'Si sangra, presionar firme y consultar.', 'Consultar si hay mano fría, cambio de color, adormecimiento o hinchazón.'],
    yes: ['Comidas livianas, agua, frutas, verduras y proteína magra.', 'Mover suavemente los dedos si no hay dolor y fue autorizado.'],
    no: ['Mojar o sumergir la muñeca el primer día si no fue autorizado.', 'Cargar fundas pesadas o apoyar peso con la mano.'],
    meals: ['Desayuno: fruta entera, huevo y café sin exceso de azúcar.', 'Almuerzo: sopa o seco de pollo con ensalada.', 'Merienda: pescado o pollo con vegetales.'],
    followUp: 'Control según indicación; habitualmente dentro de las primeras semanas.',
  },
  {
    title: 'Acceso femoral',
    summary: 'Cuidados del sitio de punción en ingle luego del procedimiento.',
    care: ['Mantener el sitio limpio y seco.', 'Evitar subir gradas en exceso, agacharse, pujar o levantar peso por los días indicados.', 'Observar hematoma, sangrado, aumento de volumen o dolor.', 'Si aparece sangrado, acostarse, presionar firme y buscar ayuda.'],
    yes: ['Caminar suave según indicación, sin esfuerzos.', 'Comida baja en sal y grasas, con buena hidratación si no hay restricción.'],
    no: ['Ejercicio intenso, bicicleta, cargar peso o viajes largos sin consultar.', 'Frituras, alcohol excesivo o comidas pesadas inmediatamente después.'],
    meals: ['Desayuno: avena o huevo con pan integral/verde pequeño.', 'Almuerzo: pescado o pollo con ensalada y porción moderada de arroz o yuca.', 'Merienda: caldo casero bajo en sal con proteína.'],
    followUp: 'Control según indicación; habitualmente dentro de las primeras semanas.',
  },
];

function loadSavedRecords() {
  try {
    const savedRecords = localStorage.getItem(storageKey);
    if (!savedRecords) return {};
    return JSON.parse(savedRecords);
  } catch {
    return {};
  }
}

function savePatientNameImmediately(nextName) {
  try {
    const currentRecords = loadSavedRecords();
    localStorage.setItem(storageKey, JSON.stringify({ ...currentRecords, patientName: nextName }));
  } catch {
    // If storage is unavailable, React state still keeps the value for the current session.
  }
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidad grado I';
  if (bmi < 40) return 'Obesidad grado II';
  return 'Obesidad grado III';
}

function isHighPressure(record) {
  return Number(record.systolic) >= 180 || Number(record.diastolic) >= 110 || Number(record.pulse) > 120;
}

function isHighGlucose(record) {
  return Number(record.value) >= 250;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isUrgentSymptom(record) {
  const text = normalizeText(`${record.symptom} ${record.notes}`);
  return ['mareo', 'desmayo', 'desmaye', 'desvanec', 'sincope'].some((word) => text.includes(word));
}

function makeConsultorioWhatsappLink(message) {
  return `https://wa.me/${consultorioWhatsapp}?text=${encodeURIComponent(message)}`;
}

function buildAppointmentWhatsAppMessage(patientName, appointmentDateTime) {
  const patientLabel = patientName?.trim() || 'paciente de ANGIOGM';
  const appointmentLabel = appointmentDateTime
    ? new Date(appointmentDateTime).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })
    : 'fecha y hora pendiente de confirmar';

  return [
    `Hola, soy ${patientLabel}.`,
    'Quisiera pedir o confirmar turno para mi control cardiológico.',
    `Fecha y hora elegida: ${appointmentLabel}.`,
  ].join('\n');
}

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildGoogleCalendarUrl(dateTime, patientName) {
  const start = new Date(dateTime);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const title = 'Consulta Cardiología Dr. Giancarlo Muñoz Rennella - ANGIOGM';
  const details = [
    `Paciente: ${patientName?.trim() || 'Paciente'}`,
    'Recordatorio sugerido: 48 horas antes.',
    'WhatsApp para pedir o confirmar turno: 0986426990.',
  ].join('\n');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getCareVisual(title) {
  const text = normalizeText(title);
  if (text.includes('hipertension')) return '🩺';
  if (text.includes('diabetes')) return '🩸';
  if (text.includes('stent')) return '❤️';
  if (text.includes('radial')) return '✋';
  if (text.includes('femoral')) return '🦵';
  return '💙';
}

function getCareListVisual(title) {
  if (title === 'Elegir') return '✅';
  if (title === 'Evitar') return '🚫';
  if (title === 'Cuidados') return '🛡️';
  return '🍽️';
}

function buildSymptomConsultMessage(record, patientName) {
  return [
    'Registro de síntoma para revisar.',
    `Paciente: ${patientName?.trim() || 'Paciente sin nombre registrado'}`,
    `Síntoma: ${record.symptom}`,
    `Intensidad: ${record.intensity}`,
    `Fecha y hora: ${record.date} ${record.time}`,
    record.notes ? `Notas: ${record.notes}` : '',
  ].filter(Boolean).join('\n');
}

function buildPressureConsultMessage(record, patientName) {
  return [
    'Registro de presión arterial / frecuencia cardíaca para revisar.',
    `Paciente: ${patientName?.trim() || 'Paciente sin nombre registrado'}`,
    `Presión: ${record.systolic || '-'} / ${record.diastolic || '-'} mmHg`,
    `Frecuencia cardíaca: ${record.pulse || '-'} lpm`,
    `Fecha y hora: ${record.date} ${record.time}`,
    record.notes ? `Observaciones: ${record.notes}` : '',
  ].filter(Boolean).join('\n');
}

function buildGlucoseConsultMessage(record, patientName) {
  return [
    'Registro de glucosa para revisar.',
    `Paciente: ${patientName?.trim() || 'Paciente sin nombre registrado'}`,
    `Glucosa: ${record.value} mg/dL (${record.type})`,
    `Fecha y hora: ${record.date} ${record.time}`,
    record.notes ? `Notas: ${record.notes}` : '',
  ].filter(Boolean).join('\n');
}

function cleanFileName(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'paciente';
}

async function getImageDataUrl(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${path}`);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function createPatientPdf({ patientName, medications, pressureRecords, glucoseRecords, bmiRecords }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;
  const navy = [29, 78, 137];
  const red = [190, 24, 45];
  const slate = [17, 24, 39];
  const generatedAt = new Date().toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  let logoDataUrl = null;
  try {
    logoDataUrl = await getImageDataUrl('/cardio-gm-logo.png');
  } catch (error) {
    console.warn(error);
  }
  let y = 78;

  function decoratePage() {
    doc.setFillColor(...red);
    doc.rect(32, 30, pageWidth - 64, 4, 'F');
    doc.setFillColor(...navy);
    doc.rect(32, 37, pageWidth - 64, 3, 'F');
    doc.setFillColor(...navy);
    doc.rect(32, pageHeight - 24, pageWidth - 64, 1.4, 'F');
    doc.setFillColor(...red);
    doc.rect(32, pageHeight - 19, pageWidth - 64, 1.8, 'F');
  }

  function ensureSpace(height) {
    if (y + height <= pageHeight - 78) return;
    doc.addPage();
    decoratePage();
    y = margin + 14;
  }

  function writeWrapped(text, x, maxWidth, options = {}) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, options);
    y += lines.length * 14;
  }

  function addHeader() {
    decoratePage();
    const logoSize = 94;
    const logoWidth = logoSize;
    const logoHeight = logoSize;
    const logoX = pageWidth - margin - logoWidth;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', logoX, 58, logoWidth, logoHeight);
    }
    doc.setTextColor(...slate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('ANGIOGM', margin, y);
    y += 28;
    doc.setTextColor(...navy);
    doc.setFontSize(16);
    doc.text('Dr. Giancarlo Muñoz Rennella', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Cardiólogo Intervencionista', margin, y);
    y = 150;

    doc.setDrawColor(...navy);
    doc.setLineWidth(1.4);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setDrawColor(...red);
    doc.setLineWidth(2);
    doc.line(margin, y + 5, margin + 128, y + 5);
    y += 22;

    const patientBoxWidth = 205;
    const patientBoxHeight = 58;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...navy);
    doc.setLineWidth(1.1);
    doc.roundedRect(margin, y, patientBoxWidth, patientBoxHeight, 10, 10, 'FD');
    doc.setFillColor(...red);
    doc.roundedRect(margin, y, 7, patientBoxHeight, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text('PACIENTE', margin + 20, y + 20);
    doc.setTextColor(...slate);
    doc.setFontSize(15);
    doc.text(patientName?.trim() || 'Sin nombre registrado', margin + 20, y + 43);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Resumen generado: ${generatedAt}`, pageWidth - margin, y + 35, { align: 'right' });
    y += 82;
  }

  function addSection(title) {
    y += 10;
    ensureSpace(54);
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(title, margin, y);
    y += 10;
    doc.setDrawColor(...navy);
    doc.setLineWidth(.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  }

  function addRecord(lines) {
    const prepared = lines.filter(Boolean);
    const estimatedHeight = prepared.reduce((total, line) => {
      doc.setFontSize(10);
      return total + doc.splitTextToSize(line, contentWidth - 38).length * 16;
    }, 42);
    ensureSpace(estimatedHeight);
    const boxTop = y - 6;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, boxTop, contentWidth, estimatedHeight, 8, 8, 'FD');
    doc.setFillColor(...navy);
    doc.roundedRect(margin, boxTop, 5, estimatedHeight, 3, 3, 'F');
    y += 14;
    prepared.forEach((line, index) => {
      doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
      doc.setFontSize(index === 0 ? 11 : 10);
      doc.setTextColor(index === 0 ? slate[0] : 51, index === 0 ? slate[1] : 65, index === 0 ? slate[2] : 85);
      writeWrapped(line, margin + 20, contentWidth - 40);
      y += 2;
    });
    y = boxTop + estimatedHeight + 16;
  }

  function addTable(columns, rows) {
    const headerHeight = 24;
    const cellPadding = 6;

    function rowHeight(row) {
      return Math.max(
        28,
        ...columns.map((column, index) => {
          const text = String(row[index] || '-');
          const lines = doc.splitTextToSize(text, column.width - cellPadding * 2);
          return lines.length * 12 + cellPadding * 2;
        }),
      );
    }

    ensureSpace(headerHeight + 30);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...navy);
    doc.setLineWidth(.8);
    doc.rect(margin, y, contentWidth, headerHeight, 'FD');

    let x = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    columns.forEach((column) => {
      doc.text(column.title, x + cellPadding, y + 16);
      doc.line(x, y, x, y + headerHeight);
      x += column.width;
    });
    doc.line(margin + contentWidth, y, margin + contentWidth, y + headerHeight);
    y += headerHeight;

    rows.forEach((row) => {
      const height = rowHeight(row);
      ensureSpace(height + headerHeight + 8);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, height, 'S');

      x = margin;
      columns.forEach((column, index) => {
        const text = String(row[index] || '-');
        const lines = doc.splitTextToSize(text, column.width - cellPadding * 2);
        doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.setTextColor(index === 0 ? slate[0] : 51, index === 0 ? slate[1] : 65, index === 0 ? slate[2] : 85);
        doc.text(lines, x + cellPadding, y + 15);
        doc.setDrawColor(203, 213, 225);
        doc.line(x, y, x, y + height);
        x += column.width;
      });
      doc.line(margin + contentWidth, y, margin + contentWidth, y + height);
      y += height;
    });
    y += 18;
  }

  addHeader();

  addSection('Medicación actual');
  if (medications.length === 0) {
    addRecord(['Sin medicación registrada.']);
  } else {
    addTable(
      [
        { title: 'Medicación', width: contentWidth * .28 },
        { title: 'Horario y dosis', width: contentWidth * .34 },
        { title: 'Efectos secundarios', width: contentWidth * .38 },
      ],
      medications.map((medication) => [
        medication.name,
        medication.schedule,
        medication.effects || 'No registrados',
      ]),
    );
  }

  addSection('Registros de presión arterial');
  if (pressureRecords.length === 0) {
    addRecord(['Sin controles de presión registrados.']);
  } else {
    addTable(
      [
        { title: 'Fecha / hora', width: contentWidth * .22 },
        { title: 'Presión', width: contentWidth * .22 },
        { title: 'FC', width: contentWidth * .14 },
        { title: 'Observaciones', width: contentWidth * .42 },
      ],
      pressureRecords.map((record) => [
        `${record.date} ${record.time}`,
        `${record.systolic || '-'} / ${record.diastolic || '-'} mmHg`,
        `${record.pulse || '-'} lpm`,
        record.notes || 'Sin observaciones',
      ]),
    );
  }

  addSection('Registros de glucosa');
  if (glucoseRecords.length === 0) {
    addRecord(['Sin controles de glucosa registrados.']);
  } else {
    addTable(
      [
        { title: 'Fecha / hora', width: contentWidth * .24 },
        { title: 'Glucosa', width: contentWidth * .22 },
        { title: 'Tipo', width: contentWidth * .16 },
        { title: 'Notas', width: contentWidth * .38 },
      ],
      glucoseRecords.map((record) => [
        `${record.date} ${record.time}`,
        `${record.value} mg/dL`,
        record.type,
        record.notes || 'Sin notas',
      ]),
    );
  }

  addSection('Registros de IMC');
  if (bmiRecords.length === 0) {
    addRecord(['Sin controles de IMC registrados.']);
  } else {
    addTable(
      [
        { title: 'Fecha / hora', width: contentWidth * .24 },
        { title: 'Peso', width: contentWidth * .16 },
        { title: 'Talla', width: contentWidth * .16 },
        { title: 'IMC', width: contentWidth * .16 },
        { title: 'Categoría', width: contentWidth * .28 },
      ],
      bmiRecords.map((record) => [
        `${record.date} ${record.time}`,
        `${record.weight} kg`,
        record.height,
        record.bmi,
        record.category,
      ]),
    );
  }

  return doc.output('blob');
}

function ReportDownloadNotice({ reportDownload }) {
  if (!reportDownload) return null;

  return (
    <div className="report-download">
      <p>{reportDownload.message}</p>
      {reportDownload.url && (
        <a className="btn soft full" href={reportDownload.url} download={reportDownload.fileName}>
          <ClipboardList size={18} />
          Descargar PDF nuevamente
        </a>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [saved, setSaved] = useState(false);
  const [urgentNotice, setUrgentNotice] = useState(null);
  const [sharingReport, setSharingReport] = useState(false);
  const [reportDownload, setReportDownload] = useState(null);
  const [patientName, setPatientName] = useState(() => loadSavedRecords().patientName || '');
  const [symptomRecords, setSymptomRecords] = useState(() => loadSavedRecords().symptomRecords || []);
  const [editingSymptomId, setEditingSymptomId] = useState(null);
  const [medications, setMedications] = useState(() => loadSavedRecords().medications || []);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [pressureRecords, setPressureRecords] = useState(() => loadSavedRecords().pressureRecords || []);
  const [glucoseRecords, setGlucoseRecords] = useState(() => loadSavedRecords().glucoseRecords || []);
  const [bmiRecords, setBmiRecords] = useState(() => loadSavedRecords().bmiRecords || []);
  const [careAppointment, setCareAppointment] = useState(() => loadSavedRecords().careAppointment || '');
  const [form, setForm] = useState({
    symptom: '',
    intensity: 'Leve',
    pressureDate: '',
    pressureTime: '',
    systolic: '',
    diastolic: '',
    pulse: '',
    pressureNotes: '',
    glucoseValue: '',
    glucoseType: 'Ayunas',
    glucoseNotes: '',
    weight: '',
    height: '',
    medName: '',
    medSchedule: '',
    medEffects: '',
    careGuide: careGuides[0].title,
    careDateTime: '',
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
      JSON.stringify({ patientName, symptomRecords, medications, pressureRecords, glucoseRecords, bmiRecords, careAppointment }),
    );
  }, [patientName, symptomRecords, medications, pressureRecords, glucoseRecords, bmiRecords, careAppointment]);

  useEffect(() => {
    return () => {
      if (reportDownload?.url) URL.revokeObjectURL(reportDownload.url);
    };
  }, [reportDownload]);

  function navigateTo(nextView) {
    setSaved(false);
    setUrgentNotice(null);
    setView(nextView);
    window.history.pushState({ view: nextView }, '', window.location.pathname);
  }

  function navigateHome() {
    setSaved(false);
    setUrgentNotice(null);
    setView('home');
    window.history.replaceState({ view: 'home' }, '', window.location.pathname);
  }

  function updatePatientName(nextName) {
    setPatientName(nextName);
    savePatientNameImmediately(nextName);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setSaved(false);
    setUrgentNotice(null);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openUrgentWhatsApp(message, title) {
    const whatsappLink = makeConsultorioWhatsappLink(message);
    setUrgentNotice({ title, whatsappLink });
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  }

  function saveSymptom(event) {
    event.preventDefault();
    if (!form.symptom.trim() && !form.notes.trim()) return;

    const existingSymptom = symptomRecords.find((item) => item.id === editingSymptomId);
    const now = new Date();
    const symptomRecord = {
      id: editingSymptomId || crypto.randomUUID(),
      symptom: form.symptom.trim() || 'Síntoma sin especificar',
      intensity: form.intensity,
      notes: form.notes.trim(),
      date: existingSymptom?.date || now.toISOString().slice(0, 10),
      time: existingSymptom?.time || now.toTimeString().slice(0, 5),
    };

    setSymptomRecords((current) => (
      editingSymptomId
        ? current.map((item) => (
            item.id === editingSymptomId
              ? { ...item, ...symptomRecord }
              : item
          ))
        : [symptomRecord, ...current]
    ));
    if (isUrgentSymptom(symptomRecord)) {
      openUrgentWhatsApp(
        buildSymptomConsultMessage(symptomRecord, patientName),
        'Síntoma de alerta registrado: enviar al consultorio.',
      );
    }
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
    let pressureRecord = null;
    let glucoseRecord = null;

    if (hasPressure) {
      pressureRecord = {
        id: crypto.randomUUID(),
        date,
        time,
        systolic: form.systolic.trim(),
        diastolic: form.diastolic.trim(),
        pulse: form.pulse.trim(),
        notes: form.pressureNotes.trim(),
      };
      setPressureRecords((current) => [
        pressureRecord,
        ...current,
      ]);
    }

    if (hasGlucose) {
      glucoseRecord = {
        id: crypto.randomUUID(),
        date,
        time,
        value: form.glucoseValue.trim(),
        type: form.glucoseType,
        notes: form.glucoseNotes.trim(),
      };
      setGlucoseRecords((current) => [
        glucoseRecord,
        ...current,
      ]);
    }

    if (pressureRecord && isHighPressure(pressureRecord)) {
      openUrgentWhatsApp(
        buildPressureConsultMessage(pressureRecord, patientName),
        'Control de alerta registrado: enviar al consultorio.',
      );
    } else if (glucoseRecord && isHighGlucose(glucoseRecord)) {
      openUrgentWhatsApp(
        buildGlucoseConsultMessage(glucoseRecord, patientName),
        'Glucosa de alerta registrada: enviar al consultorio.',
      );
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

  function deleteGlucoseRecord(recordId) {
    setGlucoseRecords((current) => current.filter((record) => record.id !== recordId));
    setSaved(false);
  }

  function saveCareAppointment(event) {
    event.preventDefault();
    if (!form.careDateTime) return;
    setCareAppointment(form.careDateTime);
    setSaved(true);
    const calendarUrl = buildGoogleCalendarUrl(form.careDateTime, patientName);
    if (calendarUrl) window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  }

  async function sharePatientReport() {
    setSharingReport(true);
    setReportDownload(null);
    try {
      const pdfBlob = await createPatientPdf({ patientName, medications, pressureRecords, glucoseRecords, bmiRecords });
      const dateLabel = new Date().toISOString().slice(0, 10);
      const fileName = `ANGIOGM-${cleanFileName(patientName)}-${dateLabel}.pdf`;
      const downloadUrl = URL.createObjectURL(pdfBlob);
      setReportDownload((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return {
          url: downloadUrl,
          fileName,
          message: 'PDF descargado. Ahora podes compartirlo por WhatsApp desde Descargas o Archivos.',
        };
      });
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (error) {
      console.error(error);
      setReportDownload({
        url: '',
        fileName: '',
        message: 'No se pudo descargar el PDF. Proba nuevamente.',
      });
    } finally {
      setSharingReport(false);
    }
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
              <span className="brand-title">ANGIOGM</span>
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
          <HomeView
            patientName={patientName}
            latestBmi={bmiRecords[0]}
            onPatientNameChange={updatePatientName}
            onSelect={navigateTo}
          />
        ) : (
          <SectionView
            section={currentSection}
            form={form}
            saved={saved}
            patientName={patientName}
            urgentNotice={urgentNotice}
            symptomRecords={symptomRecords}
            editingSymptomId={editingSymptomId}
            medications={medications}
            editingMedicationId={editingMedicationId}
            pressureRecords={pressureRecords}
            glucoseRecords={glucoseRecords}
            bmiRecords={bmiRecords}
            careAppointment={careAppointment}
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
            onDeleteGlucoseRecord={deleteGlucoseRecord}
            onDeleteBmiRecord={deleteBmiRecord}
            onSaveCareAppointment={saveCareAppointment}
            sharingReport={sharingReport}
            reportDownload={reportDownload}
            onSharePatientReport={sharePatientReport}
          />
        )}
      </main>
      <PatientReport
        patientName={patientName}
        medications={medications}
        pressureRecords={pressureRecords}
        glucoseRecords={glucoseRecords}
        bmiRecords={bmiRecords}
      />
    </>
  );
}

function HomeView({ patientName, latestBmi, onPatientNameChange, onSelect }) {
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
              <h1>ANGIOGM</h1>
            </div>
            <CardioGmLogo />
          </div>
          <h2>Dr. Giancarlo Muñoz Rennella</h2>
          <h3>Cardiólogo Intervencionista</h3>
          <p>
            Lleva un registro simple de síntomas, controles, medicación y señales de alerta para compartir información
            más ordenada con tu cardiólogo.
          </p>
          <div className="patient-hero-panel">
            <label className="patient-name-field">
              <span>Paciente</span>
              <input
                value={patientName}
                onChange={(event) => onPatientNameChange(event.target.value)}
                placeholder="Ingresar nombre"
              />
            </label>
            <div className="patient-bmi-card">
              <span>Último IMC</span>
              <strong>{latestBmi ? latestBmi.bmi : '--'}</strong>
              <p>{latestBmi ? latestBmi.category : 'Sin registro'}</p>
            </div>
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
    <img className="hero-logo" src="/cardio-gm-logo.png" alt="Logo ANGIOGM" />
  );
}

function SectionView({
  section,
  form,
  saved,
  patientName,
  urgentNotice,
  symptomRecords,
  editingSymptomId,
  medications,
  editingMedicationId,
  pressureRecords,
  glucoseRecords,
  bmiRecords,
  careAppointment,
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
  onDeleteGlucoseRecord,
  onDeleteBmiRecord,
  onSaveCareAppointment,
  sharingReport,
  reportDownload,
  onSharePatientReport,
}) {
  const Icon = section?.icon || ClipboardList;
  const selectedCareGuide = careGuides.find((guide) => guide.title === form.careGuide) || careGuides[0];

  return (
    <>
      <button className="btn light" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <section className="section-title">
        <p className="eyebrow">ANGIOGM</p>
        <h1>{section?.title}</h1>
        <p>{section?.text}</p>
      </section>

      {urgentNotice && (
        <div className="urgent-share-alert">
          <AlertTriangle size={24} />
          <div>
            <strong>{urgentNotice.title}</strong>
            <p>Se abrió WhatsApp con el mensaje preparado. Si no se abrió, toca el botón para enviarlo.</p>
          </div>
          <a className="btn whatsapp" href={urgentNotice.whatsappLink} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Enviar
          </a>
        </div>
      )}

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
          <SymptomRecords
            records={symptomRecords}
            patientName={patientName}
            onEdit={onEditSymptom}
            onDelete={onDeleteSymptom}
          />
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

          <button className="btn red full" type="button" onClick={onSharePatientReport} disabled={sharingReport}>
            <ClipboardList size={18} />
            {sharingReport ? 'Preparando PDF...' : 'Descargar PDF'}
          </button>
          <ReportDownloadNotice reportDownload={reportDownload} />
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

          <PressureRecords records={pressureRecords} patientName={patientName} onDelete={onDeletePressureRecord} />
          <GlucoseRecords records={glucoseRecords} patientName={patientName} onDelete={onDeleteGlucoseRecord} />
          <BmiRecords records={bmiRecords} onDelete={onDeleteBmiRecord} />

          <button className="btn red full" type="button" onClick={onSharePatientReport} disabled={sharingReport}>
            <ClipboardList size={18} />
            {sharingReport ? 'Preparando PDF...' : 'Descargar PDF'}
          </button>
          <ReportDownloadNotice reportDownload={reportDownload} />
        </>
      )}

      {section?.id === 'care' && (
        <>
          <label className="field care-picker">
            <span>Elegí la guía que corresponde</span>
            <select name="careGuide" value={form.careGuide} onChange={onChange}>
              {careGuides.map((guide) => (
                <option key={guide.title}>{guide.title}</option>
              ))}
            </select>
          </label>

          <article className="care-card poster-card">
            <div className="care-hero">
              <div>
                <span className="care-visual" aria-hidden="true">{getCareVisual(selectedCareGuide.title)}</span>
              </div>
              <div>
                <h2>{selectedCareGuide.title}</h2>
                <p>{selectedCareGuide.summary}</p>
              </div>
            </div>
            <CareList title="Cuidados" items={selectedCareGuide.care} />
            <div className="care-two-col">
              <CareList title="Elegir" items={selectedCareGuide.yes} />
              <CareList title="Evitar" items={selectedCareGuide.no} />
            </div>
            <CareMeals items={selectedCareGuide.meals} />
            <div className="care-follow">{selectedCareGuide.followUp}</div>
          </article>

          <form className="form-card" onSubmit={onSaveCareAppointment}>
            <label className="field">
              <span>Próximo control</span>
              <input
                type="datetime-local"
                name="careDateTime"
                value={form.careDateTime}
                onChange={onChange}
              />
            </label>
            <button className="btn primary full" type="submit">
              <CalendarDays size={18} />
              Guardar y abrir Google Calendar
            </button>
            {careAppointment && (
              <div className="report-download">
                <p>Próximo control guardado: {new Date(careAppointment).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <a className="btn soft full" href={buildGoogleCalendarUrl(careAppointment, patientName)} target="_blank" rel="noreferrer">
                  <CalendarDays size={18} />
                  Abrir en Google Calendar
                </a>
                <a
                  className="btn whatsapp full card-action"
                  href={makeConsultorioWhatsappLink(buildAppointmentWhatsAppMessage(patientName, careAppointment))}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18} />
                  Pedir turno por WhatsApp
                </a>
              </div>
            )}
          </form>
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

function CareList({ title, items }) {
  return (
    <div className="care-list">
      <h3><span aria-hidden="true">{getCareListVisual(title)}</span>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CareMeals({ items }) {
  const labels = ['Desayuno', 'Almuerzo', 'Merienda'];
  const icons = ['☀️', '🍲', '🌙'];

  return (
    <div className="meal-poster">
      <h3><span aria-hidden="true">🍽️</span> Ejemplos de comidas</h3>
      <div className="meal-grid">
        {items.map((item, index) => {
          const cleaned = item.replace(`${labels[index]}: `, '');
          return (
            <div className="meal-card" key={item}>
              <span aria-hidden="true">{icons[index] || '🍽️'}</span>
              <strong>{labels[index] || 'Comida'}</strong>
              <p>{cleaned}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatientReport({ patientName, medications, pressureRecords, glucoseRecords, bmiRecords }) {
  const generatedAt = new Date().toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="print-report" aria-label="Resumen para imprimir">
      <header>
        <div>
          <div className="print-title-row">
            <div>
              <h1>ANGIOGM</h1>
              <h2>Dr. Giancarlo Muñoz Rennella</h2>
              <p>Cardiólogo Intervencionista</p>
            </div>
          </div>
          <div className="print-meta-row">
            <div className="print-patient">
              <span>Paciente</span>
              <strong>{patientName?.trim() || 'Sin nombre registrado'}</strong>
            </div>
            <p>Resumen generado: {generatedAt}</p>
          </div>
        </div>
        <img src="/cardio-gm-logo.png" alt="Logo ANGIOGM" />
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
                  <td>{record.notes || 'Sin observaciones'}</td>
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

function SymptomRecords({ records, patientName, onEdit, onDelete }) {
  return (
    <section className="grid">
      {records.length === 0 ? (
        <article className="med-card">
          <h3>Sin síntomas cargados todavía.</h3>
          <p>Los síntomas guardados aparecerán acá para revisar la evolución antes de la consulta.</p>
        </article>
      ) : (
        records.map((record, index) => {
          const shouldNotify = isUrgentSymptom(record);
          const consultMessage = buildSymptomConsultMessage(record, patientName);

          return (
          <article className={shouldNotify ? 'med-card attention' : 'med-card'} key={record.id}>
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
            {shouldNotify && (
              <a
                className="btn whatsapp full card-action"
                href={makeConsultorioWhatsappLink(consultMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Enviar este registro al consultorio
              </a>
            )}
            <button className="btn soft full card-action" type="button" onClick={() => onEdit(record)}>
              <Edit3 size={18} />
              Editar síntoma
            </button>
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar síntoma
            </button>
          </article>
          );
        })
      )}
    </section>
  );
}

function GlucoseRecords({ records, patientName, onDelete }) {
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
        records.map((record, index) => {
          const shouldNotify = isHighGlucose(record);
          const patientLabel = patientName?.trim() || 'Paciente sin nombre registrado';
          const consultMessage = [
            'Registro de glucosa para revisar.',
            `Paciente: ${patientLabel}`,
            `Glucosa: ${record.value} mg/dL (${record.type})`,
            `Fecha y hora: ${record.date} ${record.time}`,
            record.notes ? `Notas: ${record.notes}` : '',
          ].filter(Boolean).join('\n');

          return (
          <article className={shouldNotify ? 'control-card attention' : 'control-card'} key={record.id}>
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
            {shouldNotify && (
              <a
                className="btn whatsapp full card-action"
                href={makeConsultorioWhatsappLink(consultMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Enviar este registro al consultorio
              </a>
            )}
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar glucosa
            </button>
          </article>
          );
        })
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

function PressureRecords({ records, patientName, onDelete }) {
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
        records.map((record, index) => {
          const shouldNotify = isHighPressure(record);
          const consultMessage = buildPressureConsultMessage(record, patientName);

          return (
          <article className={shouldNotify ? 'control-card attention' : 'control-card'} key={record.id}>
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
            </div>
            <p><strong>Observaciones:</strong> {record.notes || 'Sin observaciones'}</p>
            {shouldNotify && (
              <a
                className="btn whatsapp full card-action"
                href={makeConsultorioWhatsappLink(consultMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Enviar este registro al consultorio
              </a>
            )}
            <button className="btn light full card-action" type="button" onClick={() => onDelete(record.id)}>
              <X size={18} />
              Eliminar medición
            </button>
          </article>
          );
        })
      )}

      <div className="warning">
        Si una medición sale muy alta o se acompaña de dolor de pecho, falta de aire, déficit neurológico, desmayo o
        síntomas intensos, no esperar al próximo control.
      </div>
    </section>
  );
}
