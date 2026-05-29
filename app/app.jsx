/* eslint-disable */
// ============================================================
// Recall — v2.  One screen at a time.
// ============================================================
const { useState, useEffect, useMemo, useRef } = React;

// ── Session-storage persistence ──────────────────────────
// Mock data seeds state once; every mutation is mirrored to
// sessionStorage, so the prototype survives reloads within a tab
// (and resets cleanly when the tab/session closes).
const STORE_PREFIX = 'runico:v1:';
function usePersistentState(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORE_PREFIX + key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) { /* ignore parse / storage errors */ }
    return typeof initial === 'function' ? initial() : initial;
  });
  useEffect(() => {
    try { sessionStorage.setItem(STORE_PREFIX + key, JSON.stringify(val)); }
    catch (e) { /* ignore quota / serialization errors */ }
  }, [key, val]);
  return [val, setVal];
}

// ── Sample content ───────────────────────────────────────────
const REGIONS = {
  nucleus:      { x: 270, y: 165, w: 90, h: 70, label: 'Nucleus' },
  mitochondria: { x: 415, y: 195, w: 70, h: 36, label: 'Mitochondrion' },
  ribosome:     { x: 222, y: 246, w: 26, h: 26, label: 'Ribosome' },
  golgi:        { x: 150, y: 152, w: 95, h: 42, label: 'Golgi apparatus' },
  er:           { x: 410, y: 110, w: 100, h: 55, label: 'Rough ER' },
  lysosome:     { x: 460, y: 270, w: 32, h: 32, label: 'Lysosome' },
};

const QUEUE = [
  {
    id: 1, kind: 'cloze',
    q: 'The {{nucleus}} contains the cell’s genetic material.',
    a: 'nucleus',
    intervals: { again: '< 10m', hard: '6d', good: '14d', easy: '32d' },
    sourceLabel: 'Cell Biology · Ch. 4 figure',
    region: 'nucleus',
  },
  {
    id: 2, kind: 'qa',
    q: 'What name is given to the infolded inner-membrane projections of a mitochondrion?',
    a: 'Cristae.',
    intervals: { again: '< 10m', hard: '8d', good: '21d', easy: '45d' },
    sourceLabel: 'Cell Biology · Ch. 4 figure',
    region: 'mitochondria',
  },
  {
    id: 3, kind: 'qa',
    q: 'Which two organelles are the primary sites of ribosomes in a eukaryotic cell?',
    a: 'The cytosol (free) and the rough endoplasmic reticulum (bound).',
    intervals: { again: '< 10m', hard: '4d', good: '12d', easy: '30d' },
    sourceLabel: 'Cell Biology · Ch. 4 figure',
    region: 'ribosome',
  },
  {
    id: 4, kind: 'occlusion',
    q: 'Identify each region.',
    a: null,
    regions: ['nucleus', 'mitochondria', 'ribosome', 'golgi', 'er', 'lysosome'],
    intervals: { again: '< 10m', hard: '6d', good: '14d', easy: '32d' },
    sourceLabel: 'Cell Biology · Ch. 4 figure',
  },
];

const DRAFT_QUEUE = [
  { id: 'd1', kind: 'cloze', q: 'The {{nucleus}} contains the cell’s genetic material.', a: 'nucleus', region: 'nucleus' },
  { id: 'd2', kind: 'qa', q: 'Which organelle is the site of aerobic respiration?', a: 'Mitochondrion.', region: 'mitochondria' },
  { id: 'd3', kind: 'qa', q: 'What name is given to the infolded inner-membrane projections of a mitochondrion?', a: 'Cristae.', region: 'mitochondria' },
  { id: 'd4', kind: 'cloze', q: 'Rough ER is studded with {{ribosomes}}, giving it its name.', a: 'ribosomes', region: 'er' },
  { id: 'd5', kind: 'qa', q: 'What is the primary function of the Golgi apparatus?', a: 'Modifies, sorts, and packages proteins for transport.', region: 'golgi' },
  { id: 'd6', kind: 'occlusion', q: 'Identify each region of the eukaryotic cell.', a: null, regions: ['nucleus', 'mitochondria', 'ribosome', 'golgi', 'er', 'lysosome'] },
];

// Practice scopes — sources, sub-sections, all-the-way-up-to "everything".
// `isLeaf` marks an ingested source (where cards live). Folders can nest
// to any depth; the `depth` field is just bookkeeping for display.
const SCOPES = [
  { id: 'all',       label: 'Everything',                    parent: null,         depth: 0, due: 29, total: 318, last: 'today', isLeaf: false },
  { id: 'bio',       label: 'Biology',                       parent: 'all',        depth: 1, due: 19, total: 184, last: 'today', isLeaf: false },
  { id: 'bio-cell',  label: 'Cell Biology',                  parent: 'bio',        depth: 2, due: 11, total: 64,  last: 'today', isLeaf: false },
  { id: 'bio-cell-organelles', label: 'Organelles · Ch. 4',  parent: 'bio-cell',   depth: 3, due: 4,  total: 18,  last: '7d ago', isLeaf: true, pendingDrafts: 6 },
  { id: 'bio-cell-membrane',   label: 'Membrane transport',  parent: 'bio-cell',   depth: 3, due: 3,  total: 12,  last: '3d ago', isLeaf: true },
  { id: 'bio-cell-mitosis',    label: 'Mitosis · five phases', parent: 'bio-cell', depth: 3, due: 0,  total: 0,   last: 'never', isLeaf: true },
  { id: 'bio-cell-photo',      label: 'Photosynthesis',      parent: 'bio-cell',   depth: 3, due: 4,  total: 22,  last: '9d ago', isLeaf: true, paused: { at: 2, remaining: 3 } },
  { id: 'bio-genetics',        label: 'Genetics',            parent: 'bio',        depth: 2, due: 7,  total: 72,  last: '2d ago', isLeaf: false },
  { id: 'bio-ecology',         label: 'Ecology',             parent: 'bio',        depth: 2, due: 1,  total: 48,  last: '11d ago', isLeaf: false },
  { id: 'chem',                label: 'Chemistry',           parent: 'all',        depth: 1, due: 8,  total: 96,  last: '5d ago', isLeaf: false },
  { id: 'chem-organic',        label: 'Organic',             parent: 'chem',       depth: 2, due: 5,  total: 54,  last: '5d ago', isLeaf: false },
  { id: 'chem-inorganic',      label: 'Inorganic',           parent: 'chem',       depth: 2, due: 3,  total: 42,  last: '8d ago', isLeaf: false },
  { id: 'hist',                label: 'History · Modern Era', parent: 'all',       depth: 1, due: 2,  total: 38,  last: '4d ago', isLeaf: false },
];

const DEFAULT_SCOPE = 'bio-cell-organelles';

// Cards belonging to each leaf source — used by the Source Detail screen.
const SOURCE_CARDS_SEED = {
  'bio-cell-organelles': [
    { id: 'sc1', kind: 'cloze', q: 'The {{nucleus}} contains the cell’s genetic material.', a: 'nucleus' },
    { id: 'sc2', kind: 'qa', q: 'Which organelle is the site of aerobic respiration?', a: 'Mitochondrion.' },
    { id: 'sc3', kind: 'qa', q: 'What name is given to the infolded inner-membrane projections of a mitochondrion?', a: 'Cristae.' },
    { id: 'sc4', kind: 'cloze', q: 'Rough ER is studded with {{ribosomes}}, giving it its name.', a: 'ribosomes' },
    { id: 'sc5', kind: 'rev', q: 'Ribosome', a: 'Site of protein synthesis; assembles polypeptides from mRNA templates.' },
    { id: 'sc6', kind: 'qa', q: 'What is the primary function of the Golgi apparatus?', a: 'Modifies, sorts, and packages proteins.' },
    { id: 'sc7', kind: 'qa', q: 'Lysosomes contain hydrolytic enzymes that perform what general function?', a: 'Intracellular digestion — break down macromolecules, worn-out organelles, and engulfed material.' },
    { id: 'sc8', kind: 'occlusion', q: 'Identify each labeled region of the eukaryotic cell.', a: '6 regions · image occlusion', regions: ['nucleus', 'mitochondria', 'ribosome', 'golgi', 'er', 'lysosome'] },
  ],
  'bio-cell-photo': [
    { id: 'ph1', kind: 'cloze', q: 'Photosynthesis converts light energy into chemical energy stored in {{glucose}}.', a: 'glucose' },
    { id: 'ph2', kind: 'qa', q: 'In which organelle does photosynthesis take place?', a: 'The chloroplast.' },
    { id: 'ph3', kind: 'qa', q: 'What pigment absorbs light for the light-dependent reactions?', a: 'Chlorophyll.' },
    { id: 'ph4', kind: 'cloze', q: 'The light-independent reactions are also called the {{Calvin cycle}}.', a: 'Calvin cycle' },
    { id: 'ph5', kind: 'qa', q: 'Where in the chloroplast does the Calvin cycle occur?', a: 'The stroma.' },
    { id: 'ph6', kind: 'rev', q: 'Thylakoid', a: 'Membrane-bound compartment inside the chloroplast; site of the light-dependent reactions.' },
  ],
  'bio-cell-membrane': [
    { id: 'mb1', kind: 'qa', q: 'What model describes the structure of the cell membrane?', a: 'The fluid mosaic model.' },
    { id: 'mb2', kind: 'cloze', q: 'Movement of molecules down their concentration gradient without energy is called {{passive transport}}.', a: 'passive transport' },
    { id: 'mb3', kind: 'qa', q: 'Which transport process moves water across a membrane?', a: 'Osmosis.' },
    { id: 'mb4', kind: 'rev', q: 'Active transport', a: 'Movement of substances against their gradient, requiring ATP.' },
  ],
};

const KIND_LABEL = {
  qa:        'Q&A',
  cloze:     'Cloze',
  rev:       'Reversible',
  occlusion: 'Image',
};

// ── Tiny icons (only ones we use, hand-built) ────────────────
function Glyph({ name, size = 16 }) {
  const paths = {
    plus:   <path d="M12 5v14M5 12h14" />,
    close:  <path d="M18 6 6 18M6 6l12 12" />,
    arrow:  <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    back:   <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    check:  <path d="M20 6 9 17l-5-5" />,
    drag:   <><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>,
    sliders:<><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></>,
    spark:  <path d="m12 3-1.91 5.84L4 10l5.84 1.91L12 18l1.91-5.84L20 10l-5.84-1.91z" />,
    caret:  <path d="m6 9 6 6 6-6" />,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    folders:<><path d="M20 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2z" /><path d="M2 8h20" /></>,
    pencil: <><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></>,
    gear:   <><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /><circle cx="12" cy="12" r="3" /></>,
    pause:  <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
    eye:    <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    book:   <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    play:   <path d="M6 4l14 8-14 8z" />,
    restart:<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ── Cloze rendering ─────────────────────────────────────────
function Cloze({ text, revealed }) {
  const parts = text.split(/(\{\{[^}]+\}\})/);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\{\{(.+)\}\}$/);
        if (m) {
          return <span key={i} className={`cloze ${revealed ? 'is-revealed' : ''}`}>
            {revealed ? m[1] : '        '}
          </span>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

// ── Cell figure (schematic SVG) ──────────────────────────────
function CellFigure({ overlay = null }) {
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
      <ellipse cx="300" cy="200" rx="270" ry="170" fill="#F4F9FC" stroke="#A8D3EB" strokeWidth="2" />
      <ellipse cx="300" cy="200" rx="262" ry="162" fill="none" stroke="#D4E9F5" strokeWidth="0.8" strokeDasharray="2 3" />
      {[[100,300,1.6],[480,150,1.4],[250,330,1.8],[420,330,1.4],[100,170,1.4],[510,210,1.6],[280,90,1.4],[140,260,1.4],[80,210,1.4]].map((p,i) =>
        <circle key={i} cx={p[0]} cy={p[1]} r={p[2]} fill="#BCC5D0" opacity="0.4" />
      )}
      {/* Nucleus */}
      <ellipse cx="315" cy="200" rx="45" ry="35" fill="#D4E9F5" stroke="#0076B4" strokeWidth="1.6" />
      <circle cx="318" cy="196" r="12" fill="#5DAFE0" opacity="0.55" />
      <circle cx="304" cy="208" r="4" fill="#0076B4" opacity="0.3" />
      <circle cx="324" cy="212" r="3" fill="#0076B4" opacity="0.3" />
      {/* Mitochondria */}
      <g transform="translate(450, 213) rotate(-15)">
        <ellipse cx="0" cy="0" rx="33" ry="17" fill="#FCE7E7" stroke="#DC2626" strokeWidth="1.2" />
        <path d="M-22 0 Q-17 -8 -12 0 Q-7 8 -2 0 Q3 -8 8 0 Q13 8 18 0" fill="none" stroke="#B91C1C" strokeWidth="0.9" />
      </g>
      <g transform="translate(170, 320) rotate(20)" opacity="0.75">
        <ellipse cx="0" cy="0" rx="20" ry="10" fill="#FCE7E7" stroke="#DC2626" strokeWidth="0.9" />
      </g>
      {/* Ribosomes */}
      <circle cx="234" cy="258" r="5.5" fill="#0076B4" />
      <circle cx="246" cy="264" r="4.5" fill="#0076B4" opacity="0.7" />
      <circle cx="223" cy="266" r="3.5" fill="#0076B4" opacity="0.7" />
      <circle cx="395" cy="135" r="4.5" fill="#0076B4" />
      <circle cx="404" cy="143" r="3.5" fill="#0076B4" opacity="0.7" />
      <circle cx="430" cy="118" r="3.5" fill="#0076B4" opacity="0.7" />
      {/* Golgi */}
      <g transform="translate(196, 175)">
        {[0,4,8,12,16].map((y, i) => (
          <path key={i} d={`M${-30 + i*1.6} ${y} Q-10 ${y - 10} 10 ${y} Q30 ${y + 10} ${50 - i*1.6} ${y}`}
                fill="none" stroke="#16A34A" strokeWidth="1.6" opacity={1 - i * 0.12} />
        ))}
      </g>
      {/* Rough ER */}
      <g transform="translate(458, 137)">
        <path d="M0 0 Q15 -12 30 0 Q45 12 38 24 Q60 20 60 40 Q45 50 22 40 Q0 50 -15 32 Q-25 16 0 0 Z"
              fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
        {[[5,2],[22,-8],[35,-4],[50,8],[55,28],[30,42],[10,40],[-8,28],[-15,14]].map((p,i) =>
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#0076B4" />
        )}
      </g>
      {/* Lysosome */}
      <g transform="translate(476, 286)">
        <circle cx="0" cy="0" r="14" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="1.2" />
        <circle cx="-4" cy="-3" r="2.5" fill="#6D28D9" opacity="0.4" />
        <circle cx="5" cy="2" r="2" fill="#6D28D9" opacity="0.4" />
      </g>
      {/* Overlay highlight */}
      {overlay && (() => {
        const r = REGIONS[overlay];
        if (!r) return null;
        return <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6"
                     fill="rgba(0,118,180,0.10)"
                     stroke="#0076B4" strokeWidth="2" strokeDasharray="4 3" />;
      })()}
    </svg>
  );
}

// ── Screens ──────────────────────────────────────────────────

function HomeScreen({ scope, dueCount, isLeafSource, onBegin, onAdd, onChooseScope, onEditSource, draftCount, onReviewDrafts }) {
  // ─── Deprecated by folder-first navigation. Kept as a placeholder
  // so the file remains valid; not rendered from App.
  return null;
}

// ── Folder navigation ─────────────────────────────────────────
// Folders are the primary surface. Every level of the hierarchy uses
// the same view — root, intermediate spaces, and leaf sources.
// FolderView renders root + intermediate. SourceView renders a leaf
// source (where actual cards live).

function pathFor(scopes, scopeId) {
  // Build the chain from root → current (excludes 'all')
  const path = [];
  let cur = scopes.find(s => s.id === scopeId);
  while (cur && cur.id !== 'all') {
    path.unshift(cur);
    cur = scopes.find(s => s.id === cur.parent);
  }
  return path;
}

function Breadcrumb({ scopes, scope, onNavigate }) {
  const parentId = scope.parent || 'all';
  const parent = scopes.find(s => s.id === parentId);
  const label = parent && parent.id !== 'all' ? parent.label : 'All folders';
  return (
    <button className="breadcrumb" onClick={() => onNavigate(parentId)}>
      <Glyph name="back" size={14} /> {label}
    </button>
  );
}

const CARD_KIND_LABEL = { cloze: 'Cloze', qa: 'Q&A', rev: 'Reversible', occlusion: 'Image' };
const CARD_KIND_GLYPH = { cloze: 'book', qa: 'spark', rev: 'restart', occlusion: 'eye' };
function cardPreviewText(c) {
  if (c.kind === 'cloze') return c.q.replace(/\{\{(.+?)\}\}/g, '____');
  return c.q;
}

function QuickResume({ lastSession, scopes, onResume }) {
  if (!lastSession) return null;
  const target = scopes.find(s => s.id === lastSession.scopeId);
  if (!target) return null;

  const remaining = Math.max(0, lastSession.total - lastSession.position);
  let label, sub, icon;
  if (lastSession.status === 'finished') {
    label = 'Restart practice';
    sub = target.label;
    icon = 'restart';
  } else if (lastSession.status === 'paused') {
    label = 'Continue practice';
    sub = `${target.label} · ${remaining} ${remaining === 1 ? 'card' : 'cards'} remaining`;
    icon = 'pause';
  } else {
    label = 'Begin practice';
    sub = target.label;
    icon = 'play';
  }

  return (
    <button className="quick-resume" onClick={onResume}>
      <span className="quick-resume-glyph"><Glyph name={icon} size={16} /></span>
      <span className="quick-resume-text">
        <span className="quick-resume-label">{label}</span>
        <span className="quick-resume-sub">{sub}</span>
      </span>
      <Glyph name="arrow" size={16} />
    </button>
  );
}

function FolderView({
  scope, scopes, isRoot,
  draftCount, onReviewDrafts,
  lastSession, onResume, sourceCards,
  onEnterChild, onBack, onBegin,
  onCreateFolder, onAddSource,
  onRenameFolder, onDeleteFolder,
  onOpenSource,
}) {
  // ── Finder-style column view ─────────────────────────────────
  // The Single-folder view above was replaced by a multi-column
  // browser. `scope` is ignored — this view drives navigation
  // entirely from internal `path` state. We keep the prop name
  // for compatibility with the call site.
  const [path, setPath] = useState(['all']);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [creatingIn, setCreatingIn] = useState(null);   // parent id
  const [creatingName, setCreatingName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const selectedId = path[path.length - 1];
  const selectedScope = scopes.find(s => s.id === selectedId) || scopes[0];
  const selectedIsLeaf = selectedScope.isLeaf;
  const columnsToRender = selectedIsLeaf ? path.length - 1 : path.length;

  function select(parentIdx, childId) {
    setPath([...path.slice(0, parentIdx + 1), childId]);
    setEditingId(null);
    setCreatingIn(null);
    setPendingDeleteId(null);
  }
  function startRename(s) {
    setEditingId(s.id);
    setEditName(s.label);
  }
  function finishRename(id) {
    onRenameFolder(id, editName.trim() || 'Untitled');
    setEditingId(null);
  }

  // Folder counts roll up from their descendant leaf sources, so adding or
  // creating cards anywhere keeps ancestor totals current.
  function descendantStats(id) {
    let due = 0, total = 0;
    const stack = scopes.filter(s => s.parent === id);
    while (stack.length) {
      const s = stack.pop();
      if (s.isLeaf) { due += s.due || 0; total += s.total || 0; }
      else stack.push(...scopes.filter(c => c.parent === s.id));
    }
    return { due, total };
  }

  return (
    <div className="stage-inner stage-columns">
      <div className="columns-header">
        <div className="eyebrow">Tuesday · May 27</div>
        <div className="columns-header-title">Browse & practice</div>
        <QuickResume lastSession={lastSession} scopes={scopes} onResume={onResume} />
        {draftCount > 0 && (
          <button className="quiet" onClick={onReviewDrafts}
                  style={{ marginTop: 12 }}>
            <Glyph name="spark" /> {draftCount} new cards ready
          </button>
        )}
      </div>

      <div className="columns">
        {Array.from({ length: columnsToRender }).map((_, i) => {
          const parentId = path[i];
          const parent = scopes.find(s => s.id === parentId);
          const children = scopes.filter(s => s.parent === parentId);
          const selectedChild = path[i + 1];
          return (
            <div key={i} className="column">
              {parent && parent.id !== 'all' && (
                <div className="column-head">
                  <div className="column-head-title">{parent.label}</div>
                  {(() => {
                    const st = descendantStats(parent.id);
                    return (
                      <div className="column-head-meta">
                        {st.due > 0 ? `${st.due} due` : 'No cards due'}
                        {' · '}
                        {st.total} {st.total === 1 ? 'card' : 'cards'}
                      </div>
                    );
                  })()}
                  {descendantStats(parent.id).due > 0 && (
                    <button className="column-head-begin"
                            onClick={() => onBegin(parent.id)}>
                      Practice all <Glyph name="arrow" size={12} />
                    </button>
                  )}
                </div>
              )}
              {parent && parent.id === 'all' && (
                <div className="column-head">
                  <div className="column-head-title">Today</div>
                  {(() => {
                    const st = descendantStats('all');
                    return (
                      <div className="column-head-meta">
                        {st.due > 0 ? `${st.due} cards due today` : 'Nothing due'}
                      </div>
                    );
                  })()}
                  {descendantStats('all').due > 0 && (
                    <button className="column-head-begin"
                            onClick={() => onBegin('all')}>
                      Practice all <Glyph name="arrow" size={12} />
                    </button>
                  )}
                </div>
              )}

              <div className="column-list">
                {children.map(c => {
                  const isLeaf = c.isLeaf;
                  const isSelected = selectedChild === c.id;
                  const isEditing = editingId === c.id;
                  const isDeleting = pendingDeleteId === c.id;
                  return (
                    <div key={c.id}
                         className={`column-item ${isSelected ? 'is-selected' : ''} ${isLeaf ? 'is-leaf' : ''} ${isDeleting ? 'is-deleting' : ''}`}>
                      {isEditing ? (
                        <>
                          <span className="column-glyph">
                            <Glyph name={isLeaf ? 'spark' : 'folders'} size={13} />
                          </span>
                          <input
                            className="folder-rename"
                            value={editName}
                            autoFocus
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') finishRename(c.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            onBlur={() => finishRename(c.id)}
                          />
                        </>
                      ) : (
                        <button className="column-item-tap"
                                onClick={() => select(i, c.id)}>
                          <span className="column-glyph">
                            <Glyph name={isLeaf ? 'spark' : 'folders'} size={13} />
                          </span>
                          <span className="column-item-name">{c.label}</span>
                          {c.pendingDrafts > 0 && (
                            <span className="column-item-pending" title={`${c.pendingDrafts} cards waiting for review`}>
                              <Glyph name="spark" size={10} /> {c.pendingDrafts}
                            </span>
                          )}
                          {(isLeaf ? c.due : descendantStats(c.id).due) > 0 && (
                            <span className="column-item-due">{isLeaf ? c.due : descendantStats(c.id).due}</span>
                          )}
                          {!isLeaf && (
                            <Glyph name="caret"
                                   size={11}
                                   style={{ transform: 'rotate(-90deg)', color: 'currentColor', opacity: 0.4 }} />
                          )}
                        </button>
                      )}
                      <div className="column-item-actions">
                        {isDeleting ? (
                          <>
                            <button className="src-action" onClick={() => setPendingDeleteId(null)}>Cancel</button>
                            <button className="src-action src-action-destructive"
                                    onClick={() => { onDeleteFolder(c.id); setPendingDeleteId(null); }}>
                              Delete
                            </button>
                          </>
                        ) : !isEditing && (
                          <>
                            <button className="src-action src-action-quiet"
                                    onClick={(e) => { e.stopPropagation(); startRename(c); }}
                                    title="Rename">
                              <Glyph name="pencil" size={12} />
                            </button>
                            <button className="src-action src-action-quiet"
                                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(c.id); }}
                                    title="Delete">
                              <Glyph name="close" size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {creatingIn === parentId && (
                  <div className="column-item is-creating">
                    <span className="column-glyph"><Glyph name="folders" size={13} /></span>
                    <input
                      className="folder-rename"
                      value={creatingName}
                      autoFocus
                      placeholder="Folder name"
                      onChange={e => setCreatingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && creatingName.trim()) {
                          onCreateFolder({ label: creatingName.trim(), parent: parentId });
                          setCreatingIn(null);
                          setCreatingName('');
                        }
                        if (e.key === 'Escape') { setCreatingIn(null); setCreatingName(''); }
                      }}
                      onBlur={() => {
                        if (creatingName.trim()) {
                          onCreateFolder({ label: creatingName.trim(), parent: parentId });
                        }
                        setCreatingIn(null);
                        setCreatingName('');
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="column-foot">
                {parent && !parent.isLeaf && (
                  <button className="column-foot-btn"
                          onClick={() => { setCreatingIn(parentId); setCreatingName(''); }}>
                    <Glyph name="plus" size={12} /> New folder
                  </button>
                )}
                {parent && !parent.isLeaf && (
                  <button className="column-foot-btn"
                          onClick={() => onAddSource(parentId)}>
                    <Glyph name="plus" size={12} /> Add AI Cards
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {selectedIsLeaf && (
          <ActionCard
            scope={selectedScope}
            cards={sourceCards[selectedScope.id] || []}
            onBegin={() => onBegin(selectedScope.id)}
            onOpen={() => onOpenSource(selectedScope.id)}
            onEdit={() => startRename(selectedScope)}
            onDelete={() => onDeleteFolder(selectedScope.id)}
            onAddFromFile={() => onAddSource(selectedScope.id)}
            onReviewDrafts={() => onReviewDrafts(selectedScope.id)}
            isPendingDelete={pendingDeleteId === selectedScope.id}
            onConfirmDelete={() => { onDeleteFolder(selectedScope.id); setPendingDeleteId(null); setPath(path.slice(0, -1)); }}
            onCancelDelete={() => setPendingDeleteId(null)}
            askDelete={() => setPendingDeleteId(selectedScope.id)}
            renaming={editingId === selectedScope.id}
            editName={editName}
            setEditName={setEditName}
            finishRename={() => finishRename(selectedScope.id)}
          />
        )}
      </div>
    </div>
  );
}

function ActionCard({
  scope, cards = [], onBegin, onOpen, onEdit, onDelete, onAddFromFile, onReviewDrafts,
  isPendingDelete, onConfirmDelete, onCancelDelete, askDelete,
  renaming, editName, setEditName, finishRename,
}) {
  return (
    <div className="action-card">
      <div className="action-card-glyph"><Glyph name="spark" size={18} /></div>
      {renaming ? (
        <input
          className="action-card-name-input"
          value={editName}
          autoFocus
          onChange={e => setEditName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') finishRename(); }}
          onBlur={finishRename}
        />
      ) : (
        <div className="action-card-name">{scope.label}</div>
      )}
      <div className="action-card-meta">
        {scope.total} {scope.total === 1 ? 'card' : 'cards'}
        {` · ${scope.due} due`}
        {scope.last !== 'never' && ` · last ${scope.last}`}
      </div>

      {scope.paused && (
        <div className="action-card-resume">
          <Glyph name="pause" size={12} />
          Paused at card {scope.paused.at} · {scope.paused.remaining} of {scope.due} remaining
        </div>
      )}

      <div className="action-card-actions">
        {scope.pendingDrafts > 0 && (
          <button className="action-card-btn action-card-pending"
                  onClick={onReviewDrafts}>
            <Glyph name="spark" size={13} /> Review {scope.pendingDrafts} new cards
          </button>
        )}
        <button className="primary action-card-primary"
                onClick={onBegin}
                disabled={scope.due === 0 || scope.pendingDrafts > 0}>
          <Glyph name="arrow" size={14} /> {scope.paused ? 'Continue practice' : 'Begin practice'}
        </button>
        {scope.pendingDrafts > 0 && (
          <div className="action-card-blocked">
            Review the {scope.pendingDrafts} new cards before practicing.
          </div>
        )}
        <button className="action-card-btn" onClick={onOpen}>
          <Glyph name="folders" size={13} /> Open cards
        </button>
        <button className="action-card-btn" onClick={onEdit}>
          <Glyph name="pencil" size={13} /> Rename
        </button>
        <button className="action-card-btn" onClick={onAddFromFile}>
          <Glyph name="plus" size={13} /> Add more AI Cards
        </button>
        {isPendingDelete ? (
          <div className="action-card-confirm">
            <span>Delete this source and all its cards?</span>
            <div className="row-tight">
              <button className="src-action" onClick={onCancelDelete}>Cancel</button>
              <button className="src-action src-action-destructive" onClick={onConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button className="action-card-btn action-card-destructive" onClick={askDelete}>
            <Glyph name="close" size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

function CreateInlineRow({ placeholder, name, setName, onSubmit, onCancel }) {
  return (
    <div className="child-row child-row-create">
      <span className="child-glyph"><Glyph name="folders" size={14} /></span>
      <input
        className="folder-rename"
        value={name}
        autoFocus
        placeholder={placeholder}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="child-actions" style={{ opacity: 1 }}>
        <button className="src-action" onClick={onCancel}>Cancel</button>
        <button className="src-action src-action-primary" onClick={onSubmit} disabled={!name.trim()}>
          Create
        </button>
      </div>
    </div>
  );
}

function ScopeScreen({ currentScopeId, scopes, onPick, onEdit, onCreate, onCancel }) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState('all');
  const q = query.trim().toLowerCase();
  const visible = q
    ? scopes.filter(s => s.label.toLowerCase().includes(q))
    : scopes;

  // Possible parents = everything except leaf sources (depth 3+)
  const parentChoices = scopes.filter(s => s.depth < 3);

  function submitCreate() {
    const name = newName.trim();
    if (!name) return;
    onCreate({ label: name, parent: newParent });
    setCreating(false);
    setNewName('');
  }

  return (
    <div className="stage-inner">
      <div className="eyebrow">What would you like to practice?</div>

      <input
        className="scope-search"
        placeholder="Search sources, chapters, subjects…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />

      <div className="scope-list">
        {visible.map(s => {
          const isSelected = s.id === currentScopeId;
          const isLeaf = s.isLeaf;
          return (
            <div key={s.id}
                 className={`scope-item ${isSelected ? 'is-selected' : ''}`}
                 data-depth={s.depth}>
              <button className="scope-item-tap" onClick={() => onPick(s.id)}>
                <div className="scope-item-body">
                  <div className={`scope-item-label ${s.depth <= 1 ? 'is-section' : ''}`}>{s.label}</div>
                  <div className="scope-item-meta">
                    {s.total} cards · last reviewed {s.last}
                  </div>
                </div>
                <div className={`scope-due ${s.due === 0 ? 'zero' : ''}`}>{s.due}</div>
                <div className="scope-check">
                  {isSelected && <Glyph name="check" size={16} />}
                </div>
              </button>
              {isLeaf && (
                <button className="scope-edit"
                        onClick={(e) => { e.stopPropagation(); onEdit(s.id); }}
                        title="Edit this source">
                  Edit
                </button>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#9BA5B3' }}>
            Nothing matches "{query}".
          </div>
        )}
      </div>

      {creating ? (
        <div className="scope-create">
          <input
            className="scope-search"
            style={{ fontSize: 18, marginBottom: 14 }}
            placeholder="Folder name (e.g. Microbiology)"
            value={newName}
            autoFocus
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitCreate(); }}
          />
          <div className="scope-create-row">
            <label className="scope-create-label">Inside</label>
            <select className="scope-create-select"
                    value={newParent}
                    onChange={e => setNewParent(e.target.value)}>
              {parentChoices.map(p => (
                <option key={p.id} value={p.id}>
                  {'   '.repeat(p.depth)}{p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="scope-create-actions">
            <button className="quiet" onClick={() => { setCreating(false); setNewName(''); }}>Cancel</button>
            <button className="primary" onClick={submitCreate} disabled={!newName.trim()}>
              <Glyph name="check" size={14} /> Create folder
            </button>
          </div>
        </div>
      ) : (
        <button className="scope-new-btn" onClick={() => setCreating(true)}>
          <Glyph name="plus" size={14} /> New folder
        </button>
      )}

      <div className="home-actions" style={{ marginTop: 32 }}>
        <button className="quiet" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Folders management ───────────────────────────────────────
function FoldersScreen({ scopes, onRename, onDelete, onCreate, onOpenSource, onDone }) {
  const [creatingUnder, setCreatingUnder] = useState(null); // parent id or 'root'
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  function startCreate(parent) {
    setCreatingUnder(parent);
    setNewName('');
    setEditingId(null);
  }
  function submitCreate() {
    if (!newName.trim()) return;
    onCreate({ label: newName.trim(), parent: creatingUnder });
    setCreatingUnder(null);
    setNewName('');
  }
  function startRename(scope) {
    setEditingId(scope.id);
    setEditName(scope.label);
    setCreatingUnder(null);
  }
  function submitRename(id) {
    onRename(id, editName.trim() || 'Untitled');
    setEditingId(null);
  }

  return (
    <div className="stage-inner">
      <div className="eyebrow">Folders</div>
      <div className="lede center" style={{ marginBottom: 12 }}>Organize your spaces</div>
      <p className="copy center" style={{ marginTop: 0, marginBottom: 28 }}>
        Folders nest as deep as you like. Sources live inside the deepest folder.
      </p>

      <button className="scope-new-btn" onClick={() => startCreate('all')}
              style={{ marginTop: 0, marginBottom: 20 }}>
        <Glyph name="plus" size={14} /> New folder at root
      </button>

      {creatingUnder === 'all' && (
        <CreateFolderRow
          name={newName} setName={setNewName}
          onSubmit={submitCreate}
          onCancel={() => setCreatingUnder(null)}
        />
      )}

      <div className="folders-list">
        {scopes.filter(s => s.id !== 'all').map(s => {
          const isEditing = editingId === s.id;
          const isDeleting = pendingDeleteId === s.id;
          const isLeaf = s.isLeaf;
          return (
            <React.Fragment key={s.id}>
              <div className={`folder-row ${isDeleting ? 'is-deleting' : ''}`} data-depth={s.depth}>
                <span className="folder-glyph">
                  <Glyph name={isLeaf ? 'spark' : 'folders'} size={14} />
                </span>
                {isEditing ? (
                  <input
                    className="folder-rename"
                    value={editName}
                    autoFocus
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') submitRename(s.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => submitRename(s.id)}
                  />
                ) : (
                  <span className="folder-name">{s.label}</span>
                )}
                <span className="folder-meta">
                  {isLeaf ? `${s.total} cards` : `${s.total} cards`}
                </span>
                <div className="folder-actions">
                  {isDeleting ? (
                    <>
                      <button className="src-action" onClick={() => setPendingDeleteId(null)}>Cancel</button>
                      <button className="src-action src-action-destructive"
                              onClick={() => { onDelete(s.id); setPendingDeleteId(null); }}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      {isLeaf
                        ? <button className="src-action" onClick={() => onOpenSource(s.id)}>Open</button>
                        : <button className="src-action" title="Add subfolder"
                                  onClick={() => startCreate(s.id)}>
                            <Glyph name="plus" size={13} /> Subfolder
                          </button>}
                      <button className="src-action" onClick={() => startRename(s)}>
                        <Glyph name="pencil" size={13} />
                      </button>
                      <button className="src-action src-action-quiet"
                              onClick={() => setPendingDeleteId(s.id)}>
                        <Glyph name="close" size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {creatingUnder === s.id && (
                <CreateFolderRow
                  depth={s.depth + 1}
                  name={newName} setName={setNewName}
                  onSubmit={submitCreate}
                  onCancel={() => setCreatingUnder(null)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="home-actions" style={{ marginTop: 32 }}>
        <button className="primary" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

function CreateFolderRow({ depth = 1, name, setName, onSubmit, onCancel }) {
  return (
    <div className="folder-row folder-create-row" data-depth={depth}>
      <span className="folder-glyph"><Glyph name="folders" size={14} /></span>
      <input
        className="folder-rename"
        value={name}
        autoFocus
        placeholder="Folder name"
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="folder-actions" style={{ opacity: 1 }}>
        <button className="src-action" onClick={onCancel}>Cancel</button>
        <button className="src-action src-action-primary" onClick={onSubmit} disabled={!name.trim()}>
          Create
        </button>
      </div>
    </div>
  );
}
function SourceDetailScreen({ scope, scopes, cards, onChangeName, onSaveCard, onDeleteCard, onAddManual, onAddFromFile, onBegin, onBack, draftCount, onReviewDrafts }) {
  const [name, setName] = useState(scope.label);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ kind: 'qa', q: '', a: '' });
  const [addingNew, setAddingNew] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  React.useEffect(() => { setName(scope.label); }, [scope.id, scope.label]);

  function startEdit(card) {
    setAddingNew(false);
    setEditingId(card.id);
    setEditDraft({ kind: card.kind, q: card.q, a: card.a || '' });
  }
  function saveEdit() {
    onSaveCard(editingId, { ...editDraft });
    setEditingId(null);
  }
  function startAdd() {
    setEditingId(null);
    setAddingNew(true);
    setEditDraft({ kind: 'qa', q: '', a: '' });
  }
  function saveAdd() {
    const id = 'sc-' + Math.random().toString(36).slice(2, 7);
    onAddManual({ id, ...editDraft });
    setAddingNew(false);
  }

  const dueCount = scope.due;

  // Build the full path: ancestors → this source
  const crumbs = [];
  let cur = scope;
  while (cur && cur.id !== 'all') {
    crumbs.unshift(cur);
    cur = scopes.find(s => s.id === cur.parent);
  }

  return (
    <div className="stage-inner">
      <div className="add-path" style={{ marginTop: 0, marginBottom: 28 }}>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={c.id}>
              {i > 0 && <span className="add-path-sep">›</span>}
              {isLast
                ? <span className="add-path-crumb is-last">{c.label}</span>
                : <button className="add-path-crumb add-path-link"
                          onClick={() => onBack(c.id)}>
                    {c.label}
                  </button>}
            </React.Fragment>
          );
        })}
      </div>

      <div className={`home-count ${dueCount === 0 ? 'dim' : ''}`}>{dueCount}</div>
      <p className="home-label">
        {dueCount === 0 ? 'No cards due in ' : (dueCount === 1 ? 'card due in ' : 'cards due in ')}
        {editingTitle ? (
          <input
            className="folder-pill-input"
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { onChangeName(name.trim() || scope.label); setEditingTitle(false); }
              if (e.key === 'Escape') { setName(scope.label); setEditingTitle(false); }
            }}
            onBlur={() => { onChangeName(name.trim() || scope.label); setEditingTitle(false); }}
            spellCheck={false}
            size={Math.max(8, name.length + 1)}
          />
        ) : (
          <button className="folder-pill folder-pill-button" onClick={() => setEditingTitle(true)} title="Rename source">
            {name}
            <Glyph name="pencil" size={12} />
          </button>
        )}
      </p>

      <div className="home-actions">
        {dueCount > 0
          ? <button className="primary lg" onClick={onBegin}>Begin <Glyph name="arrow" size={18} /></button>
          : null}
        {draftCount > 0 && (
          <button className="quiet" onClick={onReviewDrafts}>
            <Glyph name="spark" /> {draftCount} new cards ready
          </button>
        )}
      </div>

      <div className="folder-section-head">
        <span className="folder-section-label">Cards</span>
        <span className="folder-section-count">{cards.length}</span>
      </div>

      {addingNew && (
        <div className="src-card-edit src-card-edit-new">
          <CardEditor draft={editDraft} setDraft={setEditDraft} />
          <div className="src-card-edit-actions">
            <button className="quiet" onClick={() => setAddingNew(false)}>Cancel</button>
            <button className="primary" onClick={saveAdd}
                    disabled={!editDraft.q.trim() || (editDraft.kind !== 'occlusion' && !editDraft.a.trim())}>
              <Glyph name="check" size={14} /> Save card
            </button>
          </div>
        </div>
      )}

      <div className="src-list">
        {cards.map(c => {
          const isEditing = editingId === c.id;
          const isDeleting = pendingDeleteId === c.id;
          return (
            <div key={c.id} className={`src-card ${isEditing ? 'is-editing' : ''} ${isDeleting ? 'is-deleting' : ''}`}>
              {isEditing ? (
                <>
                  <CardEditor draft={editDraft} setDraft={setEditDraft} />
                  <div className="src-card-edit-actions">
                    <button className="quiet" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="primary" onClick={saveEdit}>
                      <Glyph name="check" size={14} /> Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="src-card-body">
                    <div className="src-card-kind">{KIND_LABEL[c.kind]}</div>
                    <div className="src-card-q">
                      {c.kind === 'cloze' ? <Cloze text={c.q} revealed={true} /> : c.q}
                    </div>
                    {c.a && <div className="src-card-a">{c.a}</div>}
                  </div>
                  <div className="src-card-actions">
                    {isDeleting ? (
                      <>
                        <button className="quiet src-action" onClick={() => setPendingDeleteId(null)}>Cancel</button>
                        <button className="src-action src-action-destructive"
                                onClick={() => { onDeleteCard(c.id); setPendingDeleteId(null); }}>
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="src-action" onClick={() => startEdit(c)}>Edit</button>
                        <button className="src-action src-action-quiet" onClick={() => setPendingDeleteId(c.id)}>
                          <Glyph name="close" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {cards.length === 0 && !addingNew && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#9BA5B3' }}>
            No cards yet.
          </div>
        )}
      </div>

      <div className="folder-add-buttons">
        <button className="quiet" onClick={startAdd}>
          <Glyph name="plus" size={14} /> Add a card
        </button>
        <button className="quiet" onClick={onAddFromFile}>
          <Glyph name="plus" size={14} /> Add more AI Cards
        </button>
      </div>
    </div>
  );
}

function CardEditor({ draft, setDraft }) {
  return (
    <div className="card-editor">
      <div className="card-editor-kinds">
        {['qa', 'cloze', 'rev'].map(k => (
          <button key={k}
                  className={`card-editor-kind ${draft.kind === k ? 'is-on' : ''}`}
                  onClick={() => setDraft(d => ({ ...d, kind: k }))}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <textarea
        className="card-editor-input card-editor-q"
        placeholder={draft.kind === 'cloze' ? 'Question — wrap the blank in {{ }}' : draft.kind === 'rev' ? 'Front · the term' : 'Question'}
        value={draft.q}
        onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
        rows={2}
      />
      <textarea
        className="card-editor-input card-editor-a"
        placeholder={draft.kind === 'rev' ? 'Back · the definition' : 'Answer'}
        value={draft.a}
        onChange={e => setDraft(d => ({ ...d, a: e.target.value }))}
        rows={2}
      />
    </div>
  );
}

function StudyScreen({ card, idx, total, onGrade, onExit, onShowSource }) {
  const [revealed, setRevealed] = useState(false);
  const [occState, setOccState] = useState(null);

  useEffect(() => {
    setRevealed(false);
    setOccState(card.kind === 'occlusion' ? { step: 0, marks: [] } : null);
  }, [card.id]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (card.kind === 'occlusion') {
        if (!occState) return;
        if (e.key === '1') return; // ignore grade keys until done
      }
      if (e.code === 'Space') { e.preventDefault(); setRevealed(r => !r); }
      if (revealed && card.kind !== 'occlusion') {
        if (e.key === 'Enter') { e.preventDefault(); onGrade('good'); }
      }
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [revealed, card.id, occState]);

  // Occlusion mode
  if (card.kind === 'occlusion') {
    const regions = card.regions;
    const step = occState?.step || 0;
    const done = step >= regions.length;
    const currentRid = regions[step];
    return (
      <div className="stage-inner wide">
        <div className="progress-dots">
          {regions.map((_, i) => {
            const mark = occState?.marks[i];
            return <div key={i} className={`progress-dot ${
              i === step && !done ? 'is-current' :
              mark === 'right' ? 'is-right' :
              mark === 'wrong' ? 'is-wrong' : ''
            }`} />;
          })}
        </div>

        <div className="figure-wrap" style={{ aspectRatio: '600 / 400' }}>
          <CellFigure />
          {regions.map((rid, i) => {
            const r = REGIONS[rid];
            const isCurrent = i === step && !done;
            const past = i < step;
            const mark = occState?.marks[i];
            return (
              <div key={rid}
                   className={`occ-region ${
                     isCurrent ? (revealed ? 'is-revealed is-current-revealed' : 'is-current') :
                     past ? (mark === 'right' ? 'is-revealed is-right' : 'is-revealed is-wrong') :
                     done ? 'is-revealed' : ''
                   }`}
                   style={{
                     left:   `${(r.x / 600) * 100}%`,
                     top:    `${(r.y / 400) * 100}%`,
                     width:  `${(r.w / 600) * 100}%`,
                     height: `${(r.h / 400) * 100}%`,
                   }} />
            );
          })}
        </div>

        {!done && (
          <div style={{ marginTop: 36, textAlign: 'center' }}>
            <div className="lede center" style={{ marginBottom: 24 }}>
              {revealed
                ? <span style={{ color: '#0076B4', fontWeight: 500 }}>{REGIONS[currentRid].label}</span>
                : <span style={{ color: '#9BA5B3' }}>What’s the highlighted region?</span>}
            </div>

            {!revealed ? (
              <>
                <button className="reveal-btn" onClick={() => setRevealed(true)}><Glyph name="eye" size={15} /> Show</button>
                <div className="reveal-hint" style={{ marginTop: 14 }}>or <kbd>Space</kbd></div>
              </>
            ) : (
              <div className="row">
                <button className="quiet" onClick={() => {
                  setOccState(s => ({ step: s.step + 1, marks: [...s.marks, 'wrong'] }));
                  setRevealed(false);
                }}>Got it wrong</button>
                <button className="primary" onClick={() => {
                  setOccState(s => ({ step: s.step + 1, marks: [...s.marks, 'right'] }));
                  setRevealed(false);
                }}>Got it right <Glyph name="check" size={16} /></button>
              </div>
            )}
          </div>
        )}

        {done && (
          <div style={{ marginTop: 36 }}>
            <div className="eyebrow">
              {occState.marks.filter(m => m === 'right').length} of {regions.length} correct
            </div>
            <GradeRow onContinue={() => onGrade('good')} onPause={onExit} />
          </div>
        )}
      </div>
    );
  }

  // Q&A / cloze / reversible — same template
  return (
    <div className="stage-inner">
      <div className="eyebrow subtle">{idx + 1} of {total}</div>

      <div className="card-question">
        {card.kind === 'cloze'
          ? <Cloze text={card.q} revealed={revealed} />
          : card.q}
      </div>

      {revealed && card.kind !== 'cloze' && (
        <div className="card-answer">{card.a}</div>
      )}

      {!revealed && (
        <div className="reveal-wrap">
          <button className="reveal-btn" onClick={() => setRevealed(true)}><Glyph name="eye" size={15} /> Show answer</button>
          <button className="quiet reveal-pause" onClick={onExit}><Glyph name="pause" size={14} /> Pause</button>
        </div>
      )}

      {revealed && (
        <div className="card-foot">
          <GradeRow onContinue={() => onGrade('good')} onPause={onExit} />
          <div className="card-foot-row">
            <div className="card-meta">
              <button onClick={onShowSource}><Glyph name="book" size={13} /> Source</button>
              <span className="dot" />
              <span>{card.sourceLabel}</span>
            </div>
            <div className="card-meta">
              <span>Enter to continue</span>
              <span className="dot" />
              <span>Esc to pause</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GradeRow({ onContinue, onPause }) {
  return (
    <div className="grade-row two">
      <button className="grade grade-pause" onClick={onPause}>
        <Glyph name="pause" size={17} />
        <span className="grade-name">Pause</span>
      </button>
      <button className="grade grade-continue" onClick={onContinue}>
        <span className="grade-name">Continue</span>
        <Glyph name="arrow" size={17} />
      </button>
    </div>
  );
}

function DoneScreen({ onHome, draftCount, onReviewDrafts }) {
  return (
    <div className="stage-inner">
      <div className="done-mark">
        <Glyph name="check" size={28} />
      </div>
      <div className="lede center">Done for today.</div>
      <p className="copy center">Come back tomorrow.</p>

      <div className="home-actions">
        {draftCount > 0 && (
          <button className="primary" onClick={onReviewDrafts}>
            <Glyph name="spark" size={16} /> Review {draftCount} new cards
          </button>
        )}
        <button className="quiet" onClick={onHome}>Back home</button>
      </div>
    </div>
  );
}

function AddScreen({ targetPath, isExistingSource, onCancel, onBegin }) {
  const [name, setName] = useState('');
  const [priorities, setPriorities] = useState([
    'Definitions',
    'Labeled diagrams',
    'Examples',
    'Body prose',
  ]);
  const [dragIdx, setDragIdx] = useState(null);

  function onDrop(targetIdx) {
    if (dragIdx == null || dragIdx === targetIdx) return;
    setPriorities(p => {
      const next = [...p];
      const [m] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, m);
      return next;
    });
    setDragIdx(null);
  }

  return (
    <div className="stage-inner">
      <div className="eyebrow">
        {isExistingSource ? 'Adding more AI Cards to' : 'New AI Cards in'}
      </div>
      <div className="add-path">
        {targetPath.map((label, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="add-path-sep">›</span>}
            <span className={`add-path-crumb ${i === targetPath.length - 1 ? 'is-last' : ''}`}>{label}</span>
          </React.Fragment>
        ))}
      </div>
      {!isExistingSource && (
        <>
          <div className="lede center" style={{ marginBottom: 32 }}>What are you learning?</div>
          <input
            className="scope-search"
            style={{ fontSize: 22, marginBottom: name.trim() ? 20 : 6 }}
            placeholder="Give it a name"
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
          />
          {!name.trim() && (
            <div className="add-name-required">A name is required to continue.</div>
          )}
        </>
      )}

      <div className="drop">
        <p className="drop-title">Drop, paste, or browse</p>
        <p className="drop-sub">An image, a chapter, a screenshot, a page of notes.</p>
      </div>

      <div className="priority-list">
        <p className="priority-list-label">What matters most? Drag to reorder.</p>
        {priorities.map((p, i) => (
          <div key={p}
               className={`priority-row ${dragIdx === i ? 'dragging' : ''}`}
               draggable
               onDragStart={() => setDragIdx(i)}
               onDragOver={(e) => e.preventDefault()}
               onDrop={() => onDrop(i)}>
            <span className="priority-rank">{i + 1}</span>
            <span className="priority-handle"><Glyph name="drag" /></span>
            <span className="priority-label">{p}</span>
          </div>
        ))}
      </div>

      <div className="home-actions" style={{ marginTop: 40 }}>
        <button className="primary lg" onClick={() => onBegin(name.trim())} disabled={!isExistingSource && !name.trim()}>
          Begin <Glyph name="arrow" size={18} />
        </button>
        <button className="quiet" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ProcessingScreen({ phase, onDone }) {
  // phase: 0..4
  const phases = ['Reading', 'Understanding', 'Drafting cards', 'Choosing the best', 'Ready'];
  const message = phase < phases.length ? phases[phase] : 'Ready';
  return (
    <div className="stage-inner">
      <div className="eyebrow">Working in the background</div>
      <div className="lede center" style={{ marginBottom: 8 }}>{message}.</div>
      <p className="copy center">You can come back to this any time.</p>

      {/* Subtle progress band */}
      <div style={{ margin: '40px auto 0', width: 240, height: 2, background: '#EBEEF2', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${(phase / (phases.length - 1)) * 100}%`,
          height: '100%',
          background: '#141920',
          transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
      <div className="home-actions" style={{ marginTop: 36 }}>
        <button className="quiet" onClick={onDone}>Back home</button>
      </div>
    </div>
  );
}

function OcclusionEditor({ card }) {
  const wrapRef = useRef(null);
  const [boxes, setBoxes] = useState(() =>
    (card.regions || []).map((rid, i) => {
      const r = REGIONS[rid];
      return {
        id: 'b' + i + '-' + rid,
        x: (r.x / 600) * 100, y: (r.y / 400) * 100,
        w: (r.w / 600) * 100, h: (r.h / 400) * 100,
        label: r.label,
      };
    })
  );
  const [selId, setSelId] = useState(null);
  const drag = useRef(null);

  function getPct(e) {
    const rect = wrapRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }

  useEffect(() => {
    function move(e) {
      const d = drag.current; if (!d) return;
      const p = getPct(e);
      if (d.mode === 'create') {
        const x = Math.min(d.startX, p.x), y = Math.min(d.startY, p.y);
        const w = Math.abs(p.x - d.startX), h = Math.abs(p.y - d.startY);
        setBoxes(bs => bs.map(b => b.id === d.id ? { ...b, x, y, w, h } : b));
      } else if (d.mode === 'move') {
        const nx = d.origX + (p.x - d.startX), ny = d.origY + (p.y - d.startY);
        setBoxes(bs => bs.map(b => b.id === d.id
          ? { ...b, x: Math.max(0, Math.min(100 - b.w, nx)), y: Math.max(0, Math.min(100 - b.h, ny)) } : b));
      } else if (d.mode === 'resize') {
        const w = Math.max(3, d.origW + (p.x - d.startX));
        const h = Math.max(3, d.origH + (p.y - d.startY));
        setBoxes(bs => bs.map(b => b.id === d.id
          ? { ...b, w: Math.min(100 - b.x, w), h: Math.min(100 - b.y, h) } : b));
      }
    }
    function up() {
      const d = drag.current;
      if (d && d.mode === 'create') {
        setBoxes(bs => bs.filter(b => !(b.id === d.id && (b.w < 2 || b.h < 2))));
      }
      drag.current = null;
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  function startCreate(e) {
    const p = getPct(e);
    const id = 'b' + Date.now();
    setBoxes(bs => [...bs, { id, x: p.x, y: p.y, w: 0, h: 0, label: 'Region ' + (bs.length + 1) }]);
    setSelId(id);
    drag.current = { mode: 'create', id, startX: p.x, startY: p.y };
  }
  function startMove(e, b) {
    e.stopPropagation();
    const p = getPct(e);
    setSelId(b.id);
    drag.current = { mode: 'move', id: b.id, startX: p.x, startY: p.y, origX: b.x, origY: b.y };
  }
  function startResize(e, b) {
    e.stopPropagation();
    const p = getPct(e);
    setSelId(b.id);
    drag.current = { mode: 'resize', id: b.id, startX: p.x, startY: p.y, origW: b.w, origH: b.h };
  }
  function del(e, id) {
    e.stopPropagation();
    setBoxes(bs => bs.filter(b => b.id !== id));
    if (selId === id) setSelId(null);
  }

  return (
    <>
      <div className="figure-wrap occ-editor" ref={wrapRef} style={{ aspectRatio: '600 / 400', marginBottom: 12 }}>
        <CellFigure />
        <div className="occ-edit-surface" onPointerDown={startCreate} />
        {boxes.map(b => (
          <div key={b.id}
               className={`occ-edit-box ${selId === b.id ? 'is-sel' : ''}`}
               style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
               onPointerDown={e => startMove(e, b)}>
            {selId === b.id ? (
              <input className="occ-edit-label"
                     value={b.label}
                     onPointerDown={e => e.stopPropagation()}
                     onChange={e => setBoxes(bs => bs.map(x => x.id === b.id ? { ...x, label: e.target.value } : x))}
                     placeholder="Label" />
            ) : (
              b.label && <span className="occ-edit-tag">{b.label}</span>
            )}
            <button className="occ-edit-del" onPointerDown={e => del(e, b.id)} title="Delete">
              <Glyph name="close" size={11} />
            </button>
            <span className="occ-edit-handle" onPointerDown={e => startResize(e, b)} />
          </div>
        ))}
      </div>
      <div className="occ-edit-hint">
        <Glyph name="plus" size={12} /> Drag on the image to add a box · drag to move · pull the corner to resize
        <span className="occ-edit-count">{boxes.length} {boxes.length === 1 ? 'region' : 'regions'}</span>
      </div>
    </>
  );
}

function ReviewDraftsScreen({ onApprove, onCancel, onShowSource }) {
  const [idx, setIdx] = useState(0);
  const [decisions, setDecisions] = useState({}); // id -> 'keep' | 'skip'
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editQ, setEditQ] = useState('');
  const [editA, setEditA] = useState('');

  const card = DRAFT_QUEUE[idx];

  useEffect(() => { setRevealed(false); setEditing(false); }, [idx]);

  function decide(d) {
    setDecisions(s => ({ ...s, [card.id]: d }));
    if (idx === DRAFT_QUEUE.length - 1) {
      // Show summary after small delay
      onApprove({ ...decisions, [card.id]: d });
    } else {
      setIdx(idx + 1);
    }
  }

  if (card.kind === 'occlusion') {
    return (
      <div className="stage-inner wide">
        <div className="eyebrow">Card {idx + 1} of {DRAFT_QUEUE.length}<span className="dot" />Image occlusion · editable</div>

        <OcclusionEditor key={card.id} card={card} />

        <div className="card-question smaller">{card.q}</div>

        <div className="card-foot">
          <div className="row">
            <button className="quiet" onClick={() => decide('skip')}>Remove</button>
            <button className="primary" onClick={() => decide('keep')}>Keep <Glyph name="check" size={14} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-inner">
      <div className="eyebrow">Card {idx + 1} of {DRAFT_QUEUE.length}<span className="dot" />Drafted from source</div>

      {editing ? (
        <>
          <input className="card-question smaller"
                 value={editQ}
                 onChange={e => setEditQ(e.target.value)}
                 style={{ border: '1px solid #EBEEF2', borderRadius: 8, padding: 14, font: 'inherit', width: '100%', outline: 'none' }} />
          <input className="card-answer"
                 value={editA}
                 onChange={e => setEditA(e.target.value)}
                 style={{ border: '1px solid #EBEEF2', borderRadius: 8, padding: 14, font: 'inherit', width: '100%', outline: 'none', marginTop: 16 }} />
        </>
      ) : (
        <>
          <div className="card-question smaller">
            {card.kind === 'cloze' ? <Cloze text={card.q} revealed={revealed} /> : card.q}
          </div>
          {revealed && card.kind !== 'cloze' && <div className="card-answer muted">{card.a}</div>}
        </>
      )}

      <div className="card-foot">
        {!revealed && !editing && (
          <div className="reveal-wrap" style={{ marginTop: 24 }}>
            <button className="reveal-btn" onClick={() => setRevealed(true)}><Glyph name="eye" size={15} /> Show answer</button>
          </div>
        )}

        {(revealed || editing) && (
          <div className="card-foot-row">
            <div className="card-meta">
              <button onClick={onShowSource}><Glyph name="book" size={13} /> Source</button>
            </div>
            {editing ? (
              <div className="row-tight">
                <button className="quiet" onClick={() => setEditing(false)}>Cancel</button>
                <button className="primary" onClick={() => { setEditing(false); decide('keep'); }}>Save & keep <Glyph name="check" size={14} /></button>
              </div>
            ) : (
              <div className="row-tight">
                <button className="quiet" onClick={() => decide('skip')}>Remove</button>
                <button className="quiet" onClick={() => { setEditQ(card.q.replace(/\{\{|\}\}/g, '')); setEditA(card.a); setEditing(true); }}>Edit</button>
                <button className="primary" onClick={() => decide('keep')}>Keep <Glyph name="check" size={14} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovedScreen({ keptCount, onHome, onViewCards, topicLabel }) {
  return (
    <div className="stage-inner">
      <div className="done-mark"><Glyph name="check" size={28} /></div>
      <div className="lede center">{keptCount} cards added{topicLabel ? <> to <b style={{ fontWeight: 600 }}>{topicLabel}</b></> : ''}.</div>
      <p className="copy center">They’re in the topic now and ready to practice.</p>
      <div className="home-actions">
        {onViewCards && (
          <button className="primary" onClick={onViewCards}>
            <Glyph name="folders" size={15} /> View cards
          </button>
        )}
        <button className="quiet" onClick={onHome}>Back home</button>
      </div>
    </div>
  );
}

function SettingsScreen({ language, onLanguageChange, theme, onThemeChange, onDone }) {
  // Top 10 most-spoken languages by total speakers (native + L2),
  // shown in the locale's own script.
  const LANGUAGES = [
    { code: 'en',   label: 'English',           native: 'English' },
    { code: 'zh',   label: 'Mandarin Chinese',  native: '中文' },
    { code: 'hi',   label: 'Hindi',             native: 'हिन्दी' },
    { code: 'es',   label: 'Spanish',           native: 'Español' },
    { code: 'fr',   label: 'French',            native: 'Français' },
    { code: 'ar',   label: 'Arabic',            native: 'العربية',  rtl: true },
    { code: 'bn',   label: 'Bengali',           native: 'বাংলা' },
    { code: 'pt',   label: 'Portuguese',        native: 'Português' },
    { code: 'ru',   label: 'Russian',           native: 'Русский' },
    { code: 'ur',   label: 'Urdu',              native: 'اردو',     rtl: true },
  ];
  return (
    <div className="stage-inner">
      <div className="eyebrow">Settings</div>
      <div className="lede center" style={{ marginBottom: 32 }}>How you’d like Runico to work.</div>

      <div className="settings-section">
        <div className="settings-section-label">Appearance</div>
        <div className="settings-section-help">Pick a canvas color to learn against.</div>
        <div className="theme-list">
          {[
            { code: 'light', label: 'Light',  swatch: '#FFFFFF', text: '#141920', sub: 'White, calm' },
            { code: 'warm',  label: 'Warm',   swatch: '#FBFAF7', text: '#1A1714', sub: 'Off-white, easy on the eye' },
            { code: 'dark',  label: 'Dark',   swatch: '#141920', text: '#FBFCFD', sub: 'Near-black, low-light study' },
          ].map(T => (
            <button key={T.code}
                    className={`theme-row ${theme === T.code ? 'is-selected' : ''}`}
                    onClick={() => onThemeChange(T.code)}>
              <span className="theme-swatch"
                    style={{ background: T.swatch, color: T.text }}>
                Aa
              </span>
              <span className="theme-row-text">
                <span className="theme-row-label">{T.label}</span>
                <span className="theme-row-sub">{T.sub}</span>
              </span>
              <span className="lang-row-check">
                {theme === T.code && <Glyph name="check" size={14} />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-label">Language</div>
        <div className="settings-section-help">Cards and interface render in this language.</div>
        <div className="lang-list">
          {LANGUAGES.map(L => (
            <button key={L.code}
                    className={`lang-row ${language === L.code ? 'is-selected' : ''}`}
                    onClick={() => onLanguageChange(L.code)}>
              <span className="lang-row-native" {...(L.rtl ? { dir: 'rtl' } : {})}>{L.native}</span>
              <span className="lang-row-label">{L.label}</span>
              <span className="lang-row-check">
                {language === L.code && <Glyph name="check" size={14} />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="home-actions" style={{ marginTop: 32 }}>
        <button className="primary" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

function PageTerm({ id, region, children }) {
  return <span className={`page-term ${region === id ? 'is-active' : ''}`}>{children}</span>;
}

function SourceOverlay({ region, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-card source-page" onClick={e => e.stopPropagation()}>
        <div className="source-page-head">
          <div>
            <div className="eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Glyph name="book" size={13} /> From this source</div>
            <div className="source-page-title">Eukaryotic cell · Ch. 4</div>
          </div>
          <button className="overlay-close" onClick={onClose}><Glyph name="close" /></button>
        </div>

        <div className="source-page-body">
          <p className="source-page-lead">
            The eukaryotic cell is defined by its system of internal membranes, which
            partition the cytoplasm into specialized compartments. Chief among these is
            the <PageTerm id="nucleus" region={region}>nucleus</PageTerm>, a
            double-membraned organelle that houses the cell&rsquo;s genetic material and
            directs the synthesis of proteins.
          </p>
          <p>
            Wrapping outward from the nuclear envelope, the <PageTerm id="er" region={region}>endoplasmic
            reticulum</PageTerm> forms an interconnected network of tubules and flattened
            sheets. The <PageTerm id="ribosome" region={region}>ribosomes</PageTerm> studding
            its rough surface translate messenger RNA into the polypeptides the cell will
            export or embed in its membranes.
          </p>

          <figure className="source-page-figure">
            <div className="figure-wrap" style={{ aspectRatio: '600 / 400' }}>
              <CellFigure overlay={region} />
            </div>
            <figcaption>
              <b>Figure 4.3</b> — A generalized eukaryotic cell, showing the principal
              membrane-bound organelles and their spatial relationships.
              {region && (
                <> Highlighted: <b style={{ color: '#0076B4' }}>{REGIONS[region]?.label}</b>.</>
              )}
            </figcaption>
          </figure>

          <p>
            Energy metabolism is concentrated in the <PageTerm id="mitochondria" region={region}>mitochondria</PageTerm>,
            whose folded inner membranes — the cristae — host the electron-transport chain.
            The <PageTerm id="golgi" region={region}>Golgi apparatus</PageTerm> then modifies,
            sorts, and packages the proteins it receives from the reticulum, dispatching them
            to their destinations throughout the cell.
          </p>
          <p>
            Finally, the <PageTerm id="lysosome" region={region}>lysosomes</PageTerm> complete
            the cycle of cellular maintenance, using hydrolytic enzymes to break down
            worn-out organelles and engulfed material — a process essential to keeping the
            cell&rsquo;s interior in balance.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────

const TWEAK_DEFAULTS = {
  theme: 'light',
  size: 'normal',
  language: 'en',
};

function App() {
  const [screen, setScreen] = useState('folder');
  const [scopeId, setScopeId] = useState('all');
  const [addTargetScope, setAddTargetScope] = useState('bio-cell');
  // When adding a brand-new source (vs. adding to an existing leaf), holds { parentId, name }
  const [pendingNewSource, setPendingNewSource] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  // Tracks the last practice the user engaged with, for the quick-resume action.
  // status: 'open' (started, no progress) | 'paused' (mid-session) | 'finished'
  const [lastSession, setLastSession] = usePersistentState('lastSession', {
    scopeId: 'bio-cell-photo', status: 'paused', position: 1, total: 4,
  });
  const [draftCount, setDraftCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [overlayRegion, setOverlayRegion] = useState(undefined);
  const [tweaks, setTweaks] = usePersistentState('settings', TWEAK_DEFAULTS);

  // Source card store — keyed by scope id (only leaf sources have cards)
  const [sourceCards, setSourceCards] = usePersistentState('sourceCards', () => ({ ...SOURCE_CARDS_SEED }));
  const [scopeLabelOverrides, setScopeLabelOverrides] = usePersistentState('scopeLabels', () => ({}));
  const [scopes, setScopes] = usePersistentState('scopes', () => [...SCOPES]);

  const scope = scopes.find(s => s.id === scopeId) || scopes[0];
  const scopeLabel = scopeLabelOverrides[scope.id] || scope.label;
  const scopeForView = { ...scope, label: scopeLabel };
  const isLeafSource = scope.isLeaf;

  function createFolder({ label, parent }) {
    const parentScope = scopes.find(s => s.id === parent) || scopes[0];
    const id = 'folder-' + Math.random().toString(36).slice(2, 7);
    const depth = parentScope.depth + 1;
    const newScope = {
      id, label, parent, depth,
      due: 0, total: 0, last: 'never',
      isLeaf: false,
    };
    // Insert directly after the parent's last descendant for nice ordering
    setScopes(prev => {
      const next = [...prev];
      // Find the last existing descendant of parent
      let insertAt = next.findIndex(s => s.id === parent) + 1;
      while (insertAt < next.length && (next[insertAt].depth || 0) > parentScope.depth) {
        insertAt++;
      }
      next.splice(insertAt, 0, newScope);
      return next;
    });
    setScopeId(id);
  }

  function renameFolder(id, label) {
    setScopes(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  }

  function deleteFolder(id) {
    // Remove the folder + everything inside it
    setScopes(prev => {
      const removed = new Set([id]);
      // sweep through; if a row's parent is removed, remove the row too
      let added = true;
      while (added) {
        added = false;
        for (const s of prev) {
          if (!removed.has(s.id) && removed.has(s.parent)) {
            removed.add(s.id);
            added = true;
          }
        }
      }
      return prev.filter(s => !removed.has(s.id));
    });
    // If the currently-selected scope got deleted, fall back to root
    setScopeId(prev => {
      // Use a check via current state
      return prev;
    });
  }

  // The home count reflects scope.due (real-feeling), while the demo queue
  // (4 cards) is what actually drives the session. When the user has played
  // every card in the demo queue, we route to "done" regardless of scope size.
  const totalDue = Math.max(0, scope.due - cardIdx);

  function setTweak(k, v) {
    setTweaks(prev => ({ ...prev, [k]: v }));
  }

  function onGrade(g) {
    const next = cardIdx + 1;
    const total = Math.min(QUEUE.length, scope.due);
    // End session when either: the demo queue runs out, OR the user has
    // graded a card per their scope's due count (whichever is smaller).
    if (next >= QUEUE.length || next >= scope.due) {
      setLastSession({ scopeId: scope.id, status: 'finished', position: total, total });
      setCardIdx(0);
      setScreen('done');
    } else {
      setLastSession({ scopeId: scope.id, status: 'paused', position: next, total });
      setCardIdx(next);
    }
  }

  // Leaving study mid-session = pause. Remembers where we stopped.
  function pauseSession() {
    const total = Math.min(QUEUE.length, scope.due);
    setLastSession({
      scopeId: scope.id,
      status: cardIdx > 0 ? 'paused' : 'open',
      position: cardIdx,
      total,
    });
    setScreen('folder');
  }

  // Quick-resume action: jump back into the last practice.
  function resumeLastSession() {
    if (!lastSession) return;
    const target = scopes.find(s => s.id === lastSession.scopeId);
    if (!target) return;
    setScopeId(lastSession.scopeId);
    if (lastSession.status === 'finished') {
      const total = Math.min(QUEUE.length, target.due);
      setCardIdx(0);
      setLastSession({ scopeId: target.id, status: 'open', position: 0, total });
    } else {
      setCardIdx(lastSession.position);
    }
    setScreen('study');
  }

  function startAdd() { setScreen('add'); }
  function startBegin(newName) {
    // If we're targeting a folder (not a leaf), this is a brand-new source.
    const target = scopes.find(s => s.id === addTargetScope);
    if (target && !target.isLeaf && newName) {
      setPendingNewSource({ parentId: addTargetScope, name: newName });
    } else {
      setPendingNewSource(null);
    }
    setProcessingPhase(0);
    setScreen('processing');
    // simulate pipeline
    [1, 2, 3, 4].forEach((p, i) => {
      setTimeout(() => setProcessingPhase(p), (i + 1) * 1100);
    });
    setTimeout(() => {
      setDraftCount(DRAFT_QUEUE.length);
      setScreen('processedNotice');
    }, 5200);
  }

  function reviewDrafts(id) {
    if (id && typeof id === 'string') setAddTargetScope(id);
    setKeptCount(0);
    setScreen('reviewDrafts');
  }

  function approveDrafts(decisions) {
    const keptCards = DRAFT_QUEUE
      .filter(c => decisions[c.id] === 'keep')
      .map(c => ({
        id: 'n-' + c.id + '-' + Math.random().toString(36).slice(2, 5),
        kind: c.kind, q: c.q, a: c.a,
        ...(c.regions ? { regions: c.regions } : {}),
      }));
    const kept = keptCards.length;

    if (pendingNewSource) {
      // Create a brand-new leaf source under its parent folder.
      const parentScope = scopes.find(s => s.id === pendingNewSource.parentId);
      const newId = 'src-' + Math.random().toString(36).slice(2, 7);
      const newScope = {
        id: newId,
        label: pendingNewSource.name,
        parent: pendingNewSource.parentId,
        depth: (parentScope ? parentScope.depth : 1) + 1,
        due: kept, total: kept, last: 'today', isLeaf: true,
      };
      setScopes(prev => {
        const next = [...prev];
        let insertAt = next.findIndex(s => s.id === pendingNewSource.parentId) + 1;
        const pd = parentScope ? parentScope.depth : 1;
        while (insertAt < next.length && (next[insertAt].depth || 0) > pd) insertAt++;
        next.splice(insertAt > 0 ? insertAt : next.length, 0, newScope);
        return next;
      });
      setSourceCards(s => ({ ...s, [newId]: keptCards }));
      setAddTargetScope(newId);
      setPendingNewSource(null);
    } else {
      // Adding to an existing leaf source.
      const targetId = addTargetScope;
      if (kept > 0 && targetId) {
        setSourceCards(s => ({ ...s, [targetId]: [...keptCards, ...(s[targetId] || [])] }));
        setScopes(prev => prev.map(s => s.id === targetId
          ? { ...s, total: (s.total || 0) + kept, due: (s.due || 0) + kept, last: 'today', pendingDrafts: 0 }
          : s));
      }
    }
    setKeptCount(kept);
    setDraftCount(0);
    setScreen('approved');
  }

  // Compose currently visible source region (for overlay)
  const currentCard = QUEUE[cardIdx];

  // Inline size scaling via CSS variable (small/normal/large)
  const sizeMul = tweaks.size === 'small' ? 0.9 : tweaks.size === 'large' ? 1.12 : 1;

  return (
    <div className={`app theme-${tweaks.theme}`} style={{ ['--size-mul']: sizeMul }}>
      <div className="nav">
        <div className="nav-left">
          <button className="nav-mark" onClick={() => { setScopeId('all'); setScreen('folder'); }}>
            <img className="mark-logo" src="assets/runico-ring.png" alt="" />
            <img className="mark-wordmark" src="assets/runico-wordmark.png" alt="Runico" />
          </button>
        </div>
        <div className="nav-right">
          {(screen === 'folder' || screen === 'source' || screen === 'done') && (
            <button className="nav-btn" onClick={() => setScreen('settings')} title="Settings">
              <Glyph name="gear" size={14} /> Settings
            </button>
          )}
        </div>
      </div>

      {(screen === 'add' || screen === 'processing' || screen === 'processedNotice' || screen === 'reviewDrafts' || screen === 'settings') && (
        <div className="back-bar">
          <button className="nav-btn" onClick={() => setScreen('folder')}>
            <Glyph name="back" size={14} /> Back
          </button>
        </div>
      )}

      <div className="stage" style={{ fontSize: `calc(16px * ${sizeMul})` }}>
        {screen === 'folder' && (
          <FolderView
            scope={scopeForView}
            scopes={scopes}
            isRoot={scope.id === 'all'}
            draftCount={draftCount}
            onReviewDrafts={reviewDrafts}
            lastSession={lastSession}
            onResume={resumeLastSession}
            sourceCards={sourceCards}
            onEnterChild={(id) => { setScopeId(id); setCardIdx(0); }}
            onBack={(parentId) => { setScopeId(parentId); setCardIdx(0); }}
            onBegin={(targetId) => {
              const target = scopes.find(s => s.id === targetId);
              const startIdx = target && target.paused ? target.paused.at - 1 : 0;
              const total = Math.min(QUEUE.length, target ? target.due : 0);
              setScopeId(targetId);
              setCardIdx(startIdx);
              setLastSession({
                scopeId: targetId,
                status: startIdx > 0 ? 'paused' : 'open',
                position: startIdx,
                total,
              });
              setScreen('study');
            }}
            onCreateFolder={createFolder}
            onAddSource={(parentId) => { setAddTargetScope(parentId); setScreen('add'); }}
            onRenameFolder={renameFolder}
            onDeleteFolder={(id) => {
              deleteFolder(id);
              if (scopeId === id) setScopeId(scope.parent || 'all');
            }}
            onOpenSource={(id) => { setScopeId(id); setCardIdx(0); setScreen('source'); }}
          />
        )}
        {screen === 'source' && isLeafSource && (
          <SourceDetailScreen
            scope={scopeForView}
            scopes={scopes}
            cards={sourceCards[scope.id] || []}
            draftCount={draftCount}
            onReviewDrafts={reviewDrafts}
            onChangeName={(name) => setScopeLabelOverrides(o => ({ ...o, [scope.id]: name }))}
            onSaveCard={(id, patch) => setSourceCards(s => ({
              ...s,
              [scope.id]: (s[scope.id] || []).map(c => c.id === id ? { ...c, ...patch } : c),
            }))}
            onDeleteCard={(id) => setSourceCards(s => ({
              ...s,
              [scope.id]: (s[scope.id] || []).filter(c => c.id !== id),
            }))}
            onAddManual={(card) => setSourceCards(s => ({
              ...s,
              [scope.id]: [card, ...(s[scope.id] || [])],
            }))}
            onAddFromFile={() => { setAddTargetScope(scope.id); setScreen('add'); }}
            onBegin={() => {
              const total = Math.min(QUEUE.length, scope.due);
              setCardIdx(0);
              setLastSession({ scopeId: scope.id, status: 'open', position: 0, total });
              setScreen('study');
            }}
            onBack={(id) => {
              if (id && id !== scope.id) {
                setScopeId(id);
                setCardIdx(0);
              }
              setScreen('folder');
            }}
          />
        )}
        {screen === 'study' && currentCard && (
          <StudyScreen
            card={currentCard}
            idx={cardIdx}
            total={Math.min(QUEUE.length, scope.due)}
            onGrade={onGrade}
            onExit={pauseSession}
            onShowSource={() => setOverlayRegion(currentCard.region || null)}
          />
        )}
        {screen === 'done' && (
          <DoneScreen
            onHome={() => { setScreen('folder'); }}
            draftCount={draftCount}
            onReviewDrafts={reviewDrafts}
          />
        )}
        {screen === 'add' && (() => {
          // Build full folder path from root → target
          const crumbs = [];
          let cur = scopes.find(s => s.id === addTargetScope);
          const isExistingSource = !!cur?.isLeaf;
          while (cur && cur.id !== 'all') {
            crumbs.unshift(cur.label);
            cur = scopes.find(s => s.id === cur.parent);
          }
          if (crumbs.length === 0) crumbs.push('All folders');
          return (
            <AddScreen
              targetPath={crumbs}
              isExistingSource={isExistingSource}
              onCancel={() => setScreen('folder')}
              onBegin={startBegin}
            />
          );
        })()}
        {screen === 'processing' && (
          <ProcessingScreen
            phase={processingPhase}
            onDone={() => setScreen('folder')}
          />
        )}
        {screen === 'processedNotice' && (
          <div className="stage-inner">
            <div className="done-mark"><Glyph name="spark" size={26} /></div>
            <div className="lede center">{DRAFT_QUEUE.length} new cards drafted.</div>
            <p className="copy center">Take a look when you have a minute.</p>
            <div className="home-actions">
              <button className="primary" onClick={reviewDrafts}>Review now</button>
              <button className="quiet" onClick={() => setScreen('folder')}>Later</button>
            </div>
          </div>
        )}
        {screen === 'reviewDrafts' && (
          <ReviewDraftsScreen
            onApprove={approveDrafts}
            onCancel={() => setScreen('folder')}
            onShowSource={() => setOverlayRegion(null)}
          />
        )}
        {screen === 'approved' && (
          <ApprovedScreen
            keptCount={keptCount}
            topicLabel={(scopes.find(s => s.id === addTargetScope) || {}).label}
            onViewCards={() => {
              const target = scopes.find(s => s.id === addTargetScope);
              if (target && target.isLeaf) { setScopeId(addTargetScope); setCardIdx(0); setScreen('source'); }
              else setScreen('folder');
            }}
            onHome={() => setScreen('folder')}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            language={tweaks.language || 'en'}
            onLanguageChange={(code) => setTweak('language', code)}
            theme={tweaks.theme || 'light'}
            onThemeChange={(code) => setTweak('theme', code)}
            onDone={() => setScreen('folder')}
          />
        )}
      </div>

      {overlayRegion !== undefined && (
        <SourceOverlay region={overlayRegion} onClose={() => setOverlayRegion(undefined)} />
      )}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
