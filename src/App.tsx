import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ClueId, GameState } from './contracts';
import { clues } from './game/content';
import { availableClues, availableTopics, discover, initialState, requestHint, restoreState, solveA, solveB } from './game/engine';
import { SemanticClient } from './ai/client';
import { RadioAudio } from './audio/radio';
import './styles.css';

const stations = ['Archive desk', 'Transmitter room', 'West Reach'];
const frequencies = [88.4, 96.2, 104.8];
const saveKey = 'dead-air-save';
function saved() {
  try { return restoreState(localStorage.getItem(saveKey)); } catch { return initialState(); }
}
function motionPreference() {
  try { return localStorage.getItem('dead-air-motion') === 'reduced'; } catch { return false; }
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The receiver could not complete that request. Try again or use a topic below.';
}

/** Motion is progressive enhancement: records remain visible if observers are unavailable. */
function useArchiveMotion(started: boolean, reduced: boolean, finished: boolean) {
  useEffect(() => {
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 35px 0px' });
    elements.forEach(element => {
      if (element.getBoundingClientRect().top >= window.innerHeight) element.setAttribute('data-waiting', 'true');
      observer.observe(element);
    });
    return () => { observer.disconnect(); elements.forEach(element => element.removeAttribute('data-waiting')); };
  }, [started, reduced, finished]);
}

export default function App() {
  const [state, setState] = useState<GameState>(saved);
  const [started, setStarted] = useState(false);
  const [channel, setChannel] = useState(1);
  const [selected, setSelected] = useState<ClueId>(() => saved().finished ? 'C6' : 'C1');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerSources, setAnswerSources] = useState<ClueId[]>([]);
  const [status, setStatus] = useState('Manual topics available · AI not loaded');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const [claim, setClaim] = useState('');
  const [evidence, setEvidence] = useState<ClueId[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [sound, setSound] = useState(false);
  const [soundPending, setSoundPending] = useState(false);
  const [ambienceVolume, setAmbienceVolume] = useState(0.08);
  const [reading, setReading] = useState(false);
  const [localVoices, setLocalVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceVolume, setVoiceVolume] = useState(0.85);
  const [reduced, setReduced] = useState(motionPreference);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tuning, setTuning] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const ai = useRef(new SemanticClient());
  const audio = useRef(new RadioAudio());
  const revision = useRef(0);
  const operation = useRef(0);
  const speechRevision = useRef(0);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetTrigger = useRef<HTMLElement | null>(null);
  const transcriptHeading = useRef<HTMLHeadingElement>(null);
  const playHeading = useRef<HTMLHeadingElement>(null);
  const tuningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useArchiveMotion(started, reduced, state.finished);
  useEffect(() => {
    try { localStorage.setItem(saveKey, JSON.stringify(state)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }, [state]);
  useEffect(() => {
    try { localStorage.setItem('dead-air-motion', reduced ? 'reduced' : 'system'); } catch { /* Settings still work for this visit. */ }
  }, [reduced]);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0);
        frame = 0;
      });
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => { window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); cancelAnimationFrame(frame); };
  }, [started, state.finished]);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const refresh = () => setLocalVoices(window.speechSynthesis.getVoices().filter(voice => voice.localService && voice.lang.startsWith('en')));
    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, []);
  useEffect(() => {
    if (resetOpen) resetDialog.current?.showModal();
    else if (resetDialog.current?.open) resetDialog.current.close();
  }, [resetOpen]);
  useEffect(() => () => {
    operation.current++;
    ai.current.cancel();
    audio.current.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (tuningTimer.current) clearTimeout(tuningTimer.current);
  }, []);

  function stopReading() {
    speechRevision.current++;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setReading(false);
  }
  function update(next: GameState) {
    revision.current++;
    setState(next);
    setChoices([]);
    setAnswer('');
    setAnswerSources([]);
  }
  function selectRecord(id: ClueId, focus = false) {
    stopReading();
    selectRecordId(id);
    if (focus) requestAnimationFrame(() => transcriptHeading.current?.focus({ preventScroll: false }));
  }
  function selectRecordId(id: ClueId) { setSelected(id); }
  function inspect(id: ClueId) {
    const isNew = !state.discovered.includes(id);
    update(discover(state, id));
    selectRecord(id, window.innerWidth < 760);
    if (isNew) setNotice(`Record ${id.slice(1)} recovered. It is now in your evidence tray.`);
  }
  function tune(next: number) {
    if (next === channel) return;
    setChannel(next);
    setTuning(true);
    if (tuningTimer.current) clearTimeout(tuningTimer.current);
    tuningTimer.current = setTimeout(() => setTuning(false), 650);
  }
  async function load() {
    const token = ++operation.current;
    setReady(false);
    setLoading(true);
    try {
      await ai.current.load(message => { if (operation.current === token) setStatus(message); });
      if (operation.current === token) setReady(true);
    } catch (error) {
      if (operation.current === token) { setStatus(errorMessage(error)); setReady(false); }
    } finally { if (operation.current === token) setLoading(false); }
  }
  function cancelModel() {
    operation.current++;
    ai.current.cancel();
    setLoading(false);
    setBusy(false);
    setReady(false);
    setStatus('AI stopped. Manual topics remain available; you can retry at any time.');
  }
  async function ask() {
    if (!ready || busy || !query.trim()) return;
    const currentRevision = revision.current;
    const token = operation.current;
    setBusy(true);
    setChoices([]);
    setAnswerSources([]);
    try {
      const result = await ai.current.match(query, availableTopics(state));
      if (currentRevision !== revision.current || token !== operation.current) return;
      if (result.kind === 'none') setAnswer('That question does not connect clearly to the available records. Choose a topic below or ask about a specific detail.');
      else if (result.kind === 'clarify') {
        setAnswer('Related topics — choose one to inspect its evidence. These are suggestions, not an answer.');
        setChoices(result.topicIds);
      } else showTopic(result.topicIds[0]);
    } catch (error) {
      if (token === operation.current) { setStatus(errorMessage(error)); setReady(false); }
    } finally { if (token === operation.current) setBusy(false); }
  }
  function showTopic(id: string) {
    const topic = availableTopics(state).find(item => item.id === id);
    if (topic) { setAnswer(topic.response); setAnswerSources(topic.clues); setChoices([]); }
  }
  function solve() {
    const result = state.deductionA ? solveB(state, claim, evidence) : solveA(state, time, evidence);
    update({ ...result.state, hintLevel: result.ok ? 0 : result.state.hintLevel });
    setNotice(result.message);
    if (result.ok) {
      setEvidence([]);
      if (result.state.finished) {
        selectRecord('C6');
        requestAnimationFrame(() => document.getElementById('ending-title')?.focus());
      } else {
        tune(2);
        requestAnimationFrame(() => document.getElementById('receiver-title')?.focus());
      }
    }
  }
  function openReset() {
    resetTrigger.current = document.activeElement as HTMLElement;
    setResetOpen(true);
  }
  function closeReset() {
    setResetOpen(false);
    requestAnimationFrame(() => resetTrigger.current?.focus());
  }
  function reset() {
    cancelModel();
    audio.current.stop();
    setSound(false);
    stopReading();
    update(initialState());
    setSelected('C1');
    setChannel(1);
    setNotice('A fresh investigation. Start with the archive record.');
    setEvidence([]);
    setTime('');
    setClaim('');
    setQuery('');
    closeReset();
  }
  async function toggleSound() {
    if (soundPending) return;
    if (sound) { audio.current.stop(); setSound(false); return; }
    setSoundPending(true);
    try { await audio.current.start(ambienceVolume); setSound(true); }
    catch { setNotice('Audio is unavailable. Every clue remains readable.'); }
    finally { setSoundPending(false); }
  }
  function readTranscript() {
    if (reading) { stopReading(); return; }
    if (!localVoices.length) return;
    window.speechSynthesis.cancel();
    const token = ++speechRevision.current;
    const utterance = new SpeechSynthesisUtterance(`${current.title}. ${current.transcript}`);
    utterance.voice = localVoices[0];
    utterance.rate = 0.91;
    utterance.volume = voiceVolume;
    utterance.onend = () => { if (token === speechRevision.current) setReading(false); };
    utterance.onerror = () => { if (token === speechRevision.current) { setReading(false); setNotice('The device reader stopped. The complete transcript is still available.'); } };
    setReading(true);
    window.speechSynthesis.speak(utterance);
  }
  function begin() {
    setStarted(true);
    requestAnimationFrame(() => playHeading.current?.focus({ preventScroll: true }));
  }
  function toggleEvidence(id: ClueId) {
    setEvidence(previous => previous.includes(id) ? previous.filter(value => value !== id) : previous.length < 2 ? [...previous, id] : previous);
  }
  const current = clues.find(clue => clue.id === selected)!;
  const hasProgress = state.discovered.length > 1 || state.deductionA;
  const candidateTopics = availableTopics(state);
  const motionStyle = { '--page-progress': scrollProgress, '--archive-progress': `${state.discovered.length / 6 * 100}%` } as CSSProperties;

  return <div className={`app${reduced ? ' reduced-motion' : ''}`} style={motionStyle}>
    <a href="#main" className="skip-link">Skip to the investigation</a>
    <div className="reading-progress" aria-hidden="true" />
    <header>
      <a className="brand" href="#main">DEAD AIR<span>FIELD ARCHIVE / 017</span></a>
      <div className="header-right"><span className="live-dot" /><span className="header-signal">A SIGNAL FROM 1987</span><button onClick={openReset}>Reset</button></div>
    </header>
    <main id="main">
      {!started ? <section className="intro">
        <div className="intro-content"><p className="eyebrow">AN INTERACTIVE RADIO MYSTERY</p><h1>Some silences<br />have a <em>story.</em></h1>
          <p className="intro-copy">An abandoned station. A disputed final broadcast.<br />Six records. One voice asking to be heard correctly.</p>
          <button className="primary enter-button" onClick={begin}>Enter the archive <span aria-hidden="true">↗</span></button>
          {hasProgress && <p className="resume-note">Your saved investigation is ready to {state.finished ? 'revisit' : 'continue'}.</p>}
          <p className="fine">About 10 minutes · Fictional story · No jump scares<br />Fully readable without sound. No account required.</p>
        </div>
        <div className="intro-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="intro-frequency"><span>SEARCHING THE ARCHIVE</span><strong>88.4<small> MHz</small></strong><div className="intro-lines">{Array.from({ length: 45 }, (_, index) => <i key={index} style={{ height: 12 + Math.abs(Math.sin(index * 1.7)) * 65, '--index': index } as CSSProperties} />)}</div><span>NORTH QUAY • LAST KNOWN SIGNAL</span></div></div>
        <div className="intro-method"><span><b>01</b> Tune the receiver</span><span><b>02</b> Connect the records</span><span><b>03</b> Restore the story</span></div>
      </section> : <>
        <section className="title-row"><div><p className="eyebrow">THE LAST SIGN-OFF</p><h1 ref={playHeading} tabIndex={-1}>Listen between<br />the <em>lines.</em></h1></div>
          <div className="objective"><p>{state.finished ? 'Archive corrected. The story ends here.' : state.deductionA ? 'Find independent evidence that the warning was received.' : 'Find the true reference time of the last transmission.'}</p><span>{state.discovered.length} / 6 records recovered</span><div className="archive-meter" aria-hidden="true"><i /></div><small>{storageAvailable ? 'Progress saved on this device' : 'Storage unavailable · keep this tab open'}</small></div>
        </section>
        <nav className="journey-nav" aria-label="Investigation sections"><a href="#receiver"><span>01</span> Explore</a><a href="#evidence"><span>02</span> Evidence</a><a href={state.finished ? '#ending' : '#investigation'}><span>03</span> {state.finished ? 'Resolution' : 'Make a deduction'}</a><label><input type="checkbox" checked={reduced} onChange={event => setReduced(event.target.checked)} /> Less motion</label></nav>
        <details className="field-guide"><summary>New to the archive? A short field guide <span aria-hidden="true">+</span></summary><p>Switch channels and recover the available records. Read their transcripts, then select a conclusion and exactly two supporting records below. Questions help you locate relevant evidence; the deduction stays yours. Hints are optional and become more explicit each time.</p></details>
        <div className="workspace" id="receiver" data-reveal>
          <section className={`receiver${tuning ? ' is-tuning' : ''}`} aria-label="Radio receiver">
            <div className="receiver-top"><h2 id="receiver-title" tabIndex={-1}>NORTH QUAY</h2><span>RECEIVER No. 017</span></div>
            <div className="display"><p>CHANNEL 0{channel} <span>{tuning ? 'TUNING…' : 'ARCHIVE SIGNAL'}</span></p><strong>{frequencies[channel - 1].toFixed(1)}<small> MHz</small></strong><div className="scale" aria-hidden="true"><i style={{ left: `${15 + (channel - 1) * 35}%` }} /></div><p className="station-name" aria-live="polite">{stations[channel - 1]}</p><div className="signal-sweep" aria-hidden="true" /></div>
            <div className="hardware"><div className="speaker" aria-hidden="true" /><label className="tuner"><span className="dial" style={{ transform: `rotate(${(channel - 2) * 55}deg)` }} aria-hidden="true" /><span>TUNE FREQUENCY</span><input aria-label="Tune channel" aria-valuetext={stations[channel - 1]} type="range" min="1" max="3" value={channel} onChange={event => tune(Number(event.target.value))} /></label></div>
            <div className="station-buttons">{stations.map((station, index) => <button key={station} aria-pressed={channel === index + 1} onClick={() => tune(index + 1)}>0{index + 1}<span>{station}</span></button>)}</div>
            <div className="signal-records"><p className="eyebrow">AVAILABLE ON THIS CHANNEL</p>{availableClues(state, channel).map(clue => <button className="record-button" key={clue.id} onClick={() => inspect(clue.id)}><span><b aria-hidden="true">{state.discovered.includes(clue.id) ? '✓' : '+'}</b> {clue.title}</span><span aria-hidden="true">↗</span></button>)}{availableClues(state, channel).length === 0 && <p className="muted locked-record">This frequency is still indistinct. Correct the studio timestamp to recover its records.</p>}</div>
            <div className="sound-control"><button disabled={soundPending} aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? 'Mute receiver ambience' : 'Enable quiet receiver ambience'}</button>{sound && <label>Ambience<input type="range" min="0" max="0.2" step="0.01" value={ambienceVolume} onChange={event => { const value = Number(event.target.value); setAmbienceVolume(value); audio.current.setVolume(value); }} /></label>}</div>
          </section>
          <section className="paper" aria-label="Selected evidence"><div className="paper-content" key={current.id}><p className="eyebrow">RECORD {current.id.slice(1).padStart(2, '0')} / TRANSCRIPT</p><h2 ref={transcriptHeading} tabIndex={-1}>{current.title}</h2><p className="source">{current.source}<br /><strong>{current.time}</strong></p><blockquote>{current.transcript}</blockquote></div>
            <div className="transcript-tools">{localVoices.length > 0 ? <><button aria-pressed={reading} onClick={readTranscript}>{reading ? 'Stop reading' : 'Read transcript'} <span aria-hidden="true">{reading ? '■' : '▷'}</span></button><label>Reader volume<input type="range" min="0" max="1" step="0.05" value={voiceVolume} disabled={reading} onChange={event => setVoiceVolume(Number(event.target.value))} /></label><span>Optional local device voice · not an original recording</span></> : <span>Full text is available above. Device narration is unavailable in this browser.</span>}</div>
            <div className="paper-bottom"><span>FICTIONAL ARCHIVE • UNALTERED RECORD</span><span>↳ {current.id}</span></div>
          </section>
        </div>
        <section className="evidence-section" id="evidence" data-reveal><div className="section-label"><h2>Your evidence</h2><span>Choose a record to read it again</span></div><div className="evidence-tray">{state.discovered.map((id, index) => { const clue = clues.find(item => item.id === id)!; return <button key={id} style={{ '--card-index': index } as CSSProperties} aria-pressed={selected === id} onClick={() => selectRecord(id, true)}><span>{id}<i aria-hidden="true">↗</i></span>{clue.title}</button>; })}</div></section>
        {!state.finished ? <div className="investigation" id="investigation" data-reveal>
          <section className="question-panel"><p className="eyebrow">QUESTION THE RECORD</p><h2>Follow a thought.</h2><p className="muted">Ask in your own words. The open model suggests related topics for you to choose; every reply comes from the authored record.</p><div className={`model-state${ready ? ' model-ready' : ''}`} role="status"><span aria-hidden="true" />{status}</div>
            {!ready && <button disabled={loading} onClick={() => void load()}>{loading ? 'Preparing model…' : 'Enable on-device AI'}</button>}{loading && <button className="quiet-button" onClick={cancelModel}>Cancel download</button>}
            <form onSubmit={event => { event.preventDefault(); void ask(); }}><label htmlFor="question">Ask about the discovered records</label><textarea id="question" maxLength={240} value={query} onChange={event => setQuery(event.target.value)} placeholder={state.deductionA ? 'How do we know someone heard the warning?' : 'Could these times describe the same moment?'} aria-describedby="question-help" /><div className="question-actions"><button disabled={!ready || busy || !query.trim()} type="submit">{busy ? 'Checking the record…' : 'Find relevant evidence ↗'}</button><span>{query.length}/240</span></div></form>
            <p className="fine" id="question-help">First AI use downloads model files. Questions stay in this browser. No AI is needed to use the manual topics below.</p><div className="topic-label">{choices.length ? 'Choose the intended topic' : 'Or explore a topic directly'}</div><div className="topics">{candidateTopics.filter(topic => !choices.length || choices.includes(topic.id)).map(topic => <button key={topic.id} onClick={() => showTopic(topic.id)}>{topic.label}</button>)}</div>
            {answer && <div className="answer" role="status"><p>{answer}</p>{answerSources.length > 0 && <div className="answer-sources"><span>Check the source</span>{answerSources.map(id => <button key={id} onClick={() => selectRecord(id, true)}>{id} ↗</button>)}</div>}</div>}
          </section>
          <section className="deduction"><p className="eyebrow">DEDUCTION {state.deductionA ? '02' : '01'}</p><h2>{state.deductionA ? 'Was someone listening?' : 'Put the clocks in order.'}</h2><label htmlFor="conclusion">{state.deductionA ? 'What do the records establish?' : 'The last transmission, in reference time'}</label><select id="conclusion" value={state.deductionA ? claim : time} onChange={event => state.deductionA ? setClaim(event.target.value) : setTime(event.target.value)}><option value="">Select your conclusion</option>{state.deductionA ? <><option value="unknown">There is no confirmed receipt</option><option value="confirmed">NQ-17 was received before power loss</option><option value="survived">The operator definitely survived</option></> : ['23:10:00', '23:14:00', '23:18:00'].map(value => <option key={value}>{value}</option>)}</select>
            <fieldset><legend>Support it with two records <span className="selection-count">{evidence.length}/2 selected</span></legend>{state.discovered.filter(id => id !== 'C6').map(id => <label className={`check${evidence.includes(id) ? ' is-selected' : ''}`} key={id}><input type="checkbox" checked={evidence.includes(id)} disabled={evidence.length === 2 && !evidence.includes(id)} onChange={() => toggleEvidence(id)} /><span>{id} · {clues.find(clue => clue.id === id)!.title}</span></label>)}</fieldset><button className="primary" disabled={evidence.length !== 2 || !(state.deductionA ? claim : time)} onClick={solve}>Check the evidence ↗</button><button className="hint" onClick={() => { const result = requestHint(state); setState(result.state); setNotice(result.text); }}>Request next hint {state.hintLevel >= 2 ? '(reveals solution)' : ''}</button>
          </section>
        </div> : <section className="ending" id="ending" data-reveal><p className="eyebrow">ARCHIVE 017 / CORRECTED</p><div className="archive-stamp" aria-hidden="true">RECEIPT<br />CONFIRMED</div><h2 id="ending-title" tabIndex={-1}>Someone <em>heard.</em></h2><p>The studio clock was four minutes slow. NQ-17 was already being transmitted at the 23:18:00 reference-time checkpoint and acknowledged at 23:18:02—before the power failed at 23:18:10.</p><div className="ending-timeline"><div><strong>23:18:00</strong><span>Transmission checkpoint</span></div><div><strong>23:18:02</strong><span>Receipt confirmed</span></div><div><strong>23:18:10</strong><span>Power interrupted</span></div></div><p>You restored what the records can prove. What happened afterward remains unknown.</p><blockquote>{clues[5].transcript}</blockquote><div className="ending-actions"><button onClick={() => selectRecord('C6', true)}>Read the final sign-off ↗</button><button onClick={openReset}>Begin again</button></div><p className="fine">Your corrected archive is saved on this device. This is the end of this original fictional case.</p></section>}
        {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      </>}
    </main>
    <footer><span>DEAD AIR · THE LAST SIGN-OFF</span><span>Original fiction / Open-model investigation / No account required</span></footer>
    <dialog ref={resetDialog} className="reset-dialog" aria-labelledby="reset-title" onCancel={event => { event.preventDefault(); closeReset(); }} onClose={() => { if (resetOpen) closeReset(); }}><h2 id="reset-title">Start a new investigation?</h2><p>This clears your saved progress on this device. Your display preferences are kept.</p><div><button autoFocus onClick={closeReset}>Keep my progress</button><button onClick={reset}>Reset archive</button></div></dialog>
  </div>;
}
