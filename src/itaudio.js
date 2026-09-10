const AUDIO_MAX_DURATION_MS = 5 * 60 * 1000;
const AUDIO_HISTORY_LIMIT = 5;

export const audioIcons = {
  record: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H8v2h8v-2h-3v-3.08A7 7 0 0 0 19 11h-2Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',
};

export function audioDialogMarkup() {
  return `<div class="itarea__audio-overlay" data-audio-dialog hidden><section class="itarea__audio-dialog" role="dialog" aria-modal="true" aria-label="Record and edit audio"><header><h2>Record and edit audio</h2><button type="button" class="itarea__audio-close" data-audio-close aria-label="Close audio editor">×</button></header><p class="itarea__audio-status" data-audio-status role="status">Ready to record.</p><div class="itarea__audio-recorder"><canvas data-live-waveform width="720" height="86" aria-label="Live recording waveform"></canvas><div class="itarea__audio-record-row"><span data-record-time>0:00 / 5:00</span><button type="button" data-start-recording>${audioIcons.record}<span>Record</span></button><button type="button" data-stop-recording disabled>${audioIcons.stop}<span>Stop</span></button></div></div><div class="itarea__audio-editor" data-audio-editor hidden><audio data-editor-player controls preload="metadata"></audio><canvas data-audio-waveform width="720" height="128" aria-label="Editable audio waveform"></canvas><div class="itarea__audio-readout"><span><strong>Duration:</strong> <span data-audio-duration>0:00</span></span><span><strong>Selection:</strong> <span data-audio-selection>No selection</span></span></div><div class="itarea__audio-tool-grid"><section><h3>Preview</h3><div><button type="button" data-play-audio>Play / Pause</button><button type="button" data-play-selection disabled>Play selection</button></div></section><section><h3>Edit selection</h3><div><button type="button" data-delete-selection disabled>Delete</button><button type="button" data-silence-selection disabled>Silence</button></div></section><section><h3>History</h3><div><button type="button" data-audio-undo disabled>Undo</button><button type="button" data-audio-redo disabled>Redo</button><button type="button" data-audio-reset disabled>Reset</button></div></section><section><h3>Insert silence</h3><label>Seconds <input type="number" data-pause-duration min="0.1" max="10" step="0.1" value="1"></label><div><button type="button" data-insert-silence="start">At start</button><button type="button" data-insert-silence="cursor">At cursor</button><button type="button" data-insert-silence="end">At end</button></div></section></div><footer><button type="button" class="primary" data-save-audio>Save audio</button><a data-download-audio download>Download</a><button type="button" class="danger" data-delete-audio>Delete saved audio</button></footer></div></section></div>`;
}

function formatTime(seconds, decimals = false) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remainder = decimals ? (safe % 60).toFixed(2).padStart(5, '0') : String(Math.floor(safe % 60)).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function encodeWav(buffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const blockAlign = channels * 2;
  const output = new ArrayBuffer(44 + frames * blockAlign);
  const view = new DataView(output);
  let offset = 0;
  const text = value => { for (const character of value) view.setUint8(offset++, character.charCodeAt(0)); };
  const u16 = value => { view.setUint16(offset, value, true); offset += 2; };
  const u32 = value => { view.setUint32(offset, value, true); offset += 4; };
  text('RIFF'); u32(36 + frames * blockAlign); text('WAVE'); text('fmt '); u32(16); u16(1); u16(channels);
  u32(sampleRate); u32(sampleRate * blockAlign); u16(blockAlign); u16(16); text('data'); u32(frames * blockAlign);
  const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, data[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([output], { type: 'audio/wav' });
}

function copyBuffer(context, source) {
  const result = context.createBuffer(source.numberOfChannels, source.length, source.sampleRate);
  for (let channel = 0; channel < source.numberOfChannels; channel++) result.copyToChannel(source.getChannelData(channel), channel);
  return result;
}

function deleteRange(context, source, start, end) {
  const result = context.createBuffer(source.numberOfChannels, Math.max(1, source.length - (end - start)), source.sampleRate);
  for (let channel = 0; channel < source.numberOfChannels; channel++) {
    const input = source.getChannelData(channel); const output = result.getChannelData(channel);
    output.set(input.subarray(0, start)); output.set(input.subarray(end), start);
  }
  return result;
}

function silenceRange(context, source, start, end) {
  const result = copyBuffer(context, source);
  for (let channel = 0; channel < result.numberOfChannels; channel++) result.getChannelData(channel).fill(0, start, end);
  return result;
}

function insertSilence(context, source, position, frames) {
  const result = context.createBuffer(source.numberOfChannels, source.length + frames, source.sampleRate);
  for (let channel = 0; channel < source.numberOfChannels; channel++) {
    const input = source.getChannelData(channel); const output = result.getChannelData(channel);
    output.set(input.subarray(0, position)); output.set(input.subarray(position), position + frames);
  }
  return result;
}

function drawWaveform(canvas, buffer, selection, cursorSeconds) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const box = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round((box.width || 720) * ratio));
  const height = Math.max(1, Math.round((box.height || 128) * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height); context.fillStyle = '#fff'; context.fillRect(0, 0, width, height);
  if (!buffer) return;
  const data = buffer.getChannelData(0); const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
  context.strokeStyle = '#7a9b8c'; context.lineWidth = Math.max(1, ratio); context.beginPath();
  for (let x = 0; x < width; x++) {
    let min = 1; let max = -1; const start = x * samplesPerPixel; const finish = Math.min(data.length, start + samplesPerPixel);
    for (let index = start; index < finish; index++) { min = Math.min(min, data[index]); max = Math.max(max, data[index]); }
    context.moveTo(x, (1 + min) * height / 2); context.lineTo(x, (1 + max) * height / 2);
  }
  context.stroke();
  if (selection) {
    const left = selection.start / buffer.duration * width; const right = selection.end / buffer.duration * width;
    context.fillStyle = 'rgba(119,75,10,.22)'; context.fillRect(left, 0, Math.max(1, right - left), height);
  }
  const cursor = Math.max(0, Math.min(width, cursorSeconds / buffer.duration * width));
  context.strokeStyle = '#774b0a'; context.lineWidth = 2 * ratio; context.beginPath(); context.moveTo(cursor, 0); context.lineTo(cursor, height); context.stroke();
}

function audioExtension(type) {
  if (type.includes('wav')) return 'wav';
  if (type.includes('mp4')) return 'm4a';
  if (type.includes('ogg')) return 'ogg';
  return 'webm';
}

let activeController = null;

export function createAudioController(widget) {
  const dialog = widget.querySelector('[data-audio-dialog]');
  const status = widget.querySelector('[data-audio-status]');
  const editor = widget.querySelector('[data-audio-editor]');
  const liveCanvas = widget.querySelector('[data-live-waveform]');
  const waveform = widget.querySelector('[data-audio-waveform]');
  const player = widget.querySelector('[data-editor-player]');
  const outsidePlay = widget.querySelector('[data-audio-play]');
  const recordButton = widget.querySelector('[data-audio-record]');
  const startButton = widget.querySelector('[data-start-recording]');
  const stopButton = widget.querySelector('[data-stop-recording]');
  const timer = widget.querySelector('[data-record-time]');
  const saveButton = widget.querySelector('[data-save-audio]');
  const deleteSavedButton = widget.querySelector('[data-delete-audio]');
  const download = widget.querySelector('[data-download-audio]');
  let savedBlob = null; let savedDurationMs = 0; let savedText = ''; let savedUrl = null;
  let workingBlob = null; let workingBuffer = null; let originalBuffer = null; let workingUrl = null;
  let audioContext = null; let selection = null; let cursorSeconds = 0; let selectionEnd = null;
  let undoStack = []; let redoStack = []; let edited = false;
  let recorder = null; let stream = null; let chunks = []; let recordingStarted = 0; let limitTimer = null; let timerId = null;
  let liveContext = null; let liveAnalyser = null; let liveSource = null; let liveFrame = null; let destroyed = false;
  const outsideAudio = new Audio();

  const setStatus = (message, error = false) => { status.textContent = message; status.classList.toggle('error', error); };
  const textNow = () => widget.value || '';
  const isStale = () => Boolean(savedBlob && savedText !== textNow());
  const updateOutside = () => {
    outsidePlay.disabled = !savedBlob;
    outsidePlay.classList.toggle('is-stale', isStale());
    outsidePlay.title = !savedBlob ? 'No recorded audio' : isStale() ? 'Play audio — text changed after recording' : 'Play recorded audio';
    outsidePlay.setAttribute('aria-label', outsidePlay.title);
    deleteSavedButton.disabled = !savedBlob;
  };
  const revoke = url => { if (url) URL.revokeObjectURL(url); };
  const setWorkingUrl = blob => {
    revoke(workingUrl); workingUrl = URL.createObjectURL(blob); player.src = workingUrl;
    download.href = workingUrl; download.download = `itarea-recording.${audioExtension(blob.type)}`;
  };
  const selectedFrames = () => {
    if (!workingBuffer || !selection) return null;
    const start = Math.max(0, Math.floor(selection.start * workingBuffer.sampleRate));
    const end = Math.min(workingBuffer.length, Math.ceil(selection.end * workingBuffer.sampleRate));
    return end > start ? { start, end } : null;
  };
  const updateEditor = () => {
    const frames = selectedFrames();
    widget.querySelector('[data-audio-duration]').textContent = workingBuffer ? `${formatTime(workingBuffer.duration, true)} / 5:00` : '0:00';
    widget.querySelector('[data-audio-selection]').textContent = selection ? `${formatTime(selection.start, true)} – ${formatTime(selection.end, true)}` : 'No selection';
    widget.querySelector('[data-play-selection]').disabled = !frames;
    widget.querySelector('[data-delete-selection]').disabled = !frames;
    widget.querySelector('[data-silence-selection]').disabled = !frames;
    widget.querySelector('[data-audio-undo]').disabled = !undoStack.length;
    widget.querySelector('[data-audio-redo]').disabled = !redoStack.length;
    widget.querySelector('[data-audio-reset]').disabled = !edited;
    saveButton.disabled = !workingBlob;
    drawWaveform(waveform, workingBuffer, selection, cursorSeconds);
  };
  const decode = async blob => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('Audio editing is not supported by this browser.');
    audioContext ||= new Context();
    if (audioContext.state === 'suspended') await audioContext.resume();
    return audioContext.decodeAudioData(await blob.arrayBuffer());
  };
  const loadWorking = async(blob, resetOriginal = true) => {
    setStatus('Loading waveform…');
    workingBlob = blob; workingBuffer = await decode(blob);
    if (workingBuffer.duration > AUDIO_MAX_DURATION_MS / 1000 + .5) throw new Error('Audio cannot be longer than five minutes.');
    if (resetOriginal) { originalBuffer = workingBuffer; undoStack = []; redoStack = []; edited = false; }
    selection = null; cursorSeconds = 0; setWorkingUrl(blob); editor.hidden = false; updateEditor(); setStatus('Ready. Drag across the waveform to select audio.');
  };
  const applyEdit = buffer => {
    undoStack.push(workingBuffer); if (undoStack.length > AUDIO_HISTORY_LIMIT) undoStack.shift();
    redoStack = []; workingBuffer = buffer; workingBlob = encodeWav(buffer); edited = true; selection = null;
    cursorSeconds = Math.min(cursorSeconds, buffer.duration); setWorkingUrl(workingBlob); updateEditor(); setStatus('Edit applied. Preview the result before saving.');
  };
  const save = async({ closeDialog = false } = {}) => {
    if (!workingBlob) return;
    const record = { blob: workingBlob, durationMs: Math.round((workingBuffer?.duration || 0) * 1000), text: textNow() };
    setStatus('Audio is ready for this page session. Use Save to export it.');
    savedBlob = record.blob; savedDurationMs = record.durationMs; savedText = record.text;
    revoke(savedUrl); savedUrl = URL.createObjectURL(savedBlob); updateOutside();
    widget.dispatchEvent(new CustomEvent('audiochange', { bubbles: true, detail: { blob: savedBlob, durationMs: savedDurationMs } }));
    if (closeDialog) {
      dialog.hidden = true;
      widget.input?.focus();
    }
  };
  const removeSaved = async() => {
    savedBlob = null; savedDurationMs = 0; savedText = ''; revoke(savedUrl); savedUrl = null; updateOutside();
    outsideAudio.pause(); outsideAudio.removeAttribute('src'); outsidePlay.innerHTML = audioIcons.play;
    widget.dispatchEvent(new CustomEvent('audiochange', { bubbles: true, detail: { blob: null, durationMs: 0 } }));
    setStatus('Saved audio deleted.');
  };
  const clearWorking = () => {
    player.pause();
    workingBlob = null; workingBuffer = null; originalBuffer = null;
    selection = null; cursorSeconds = 0; selectionEnd = null;
    undoStack = []; redoStack = []; edited = false;
    revoke(workingUrl); workingUrl = null;
    player.removeAttribute('src'); download.removeAttribute('href');
    editor.hidden = true; updateEditor();
  };
  const stopLiveWaveform = () => {
    if (liveFrame) cancelAnimationFrame(liveFrame); liveFrame = null;
    liveSource?.disconnect(); liveAnalyser?.disconnect(); liveContext?.close().catch(() => {});
    liveContext = null; liveSource = null; liveAnalyser = null;
  };
  const startLiveWaveform = async mediaStream => {
    const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return;
    liveContext = new Context(); await liveContext.resume(); liveAnalyser = liveContext.createAnalyser(); liveAnalyser.fftSize = 1024;
    liveSource = liveContext.createMediaStreamSource(mediaStream); liveSource.connect(liveAnalyser);
    const data = new Uint8Array(liveAnalyser.fftSize); const context = liveCanvas.getContext('2d');
    const draw = () => { const width = liveCanvas.width; const height = liveCanvas.height; liveAnalyser.getByteTimeDomainData(data); context.clearRect(0, 0, width, height); context.fillStyle = '#fff'; context.fillRect(0, 0, width, height); context.strokeStyle = '#a52720'; context.lineWidth = 2; context.beginPath(); data.forEach((sample, index) => { const x = index / (data.length - 1) * width; const y = sample / 255 * height; index ? context.lineTo(x, y) : context.moveTo(x, y); }); context.stroke(); liveFrame = requestAnimationFrame(draw); };
    draw();
  };
  const finishRecording = () => {
    if (recorder?.state === 'recording') recorder.stop();
  };
  const startRecording = async() => {
    try {
      if (activeController && activeController !== controller) activeController.stopRecording();
      activeController = controller;
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      const types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
      const type = types.find(candidate => MediaRecorder.isTypeSupported(candidate)) || '';
      recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined); chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async() => {
        clearTimeout(limitTimer); clearInterval(timerId); stopLiveWaveform(); stream?.getTracks().forEach(track => track.stop()); stream = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || type || 'audio/webm' });
        startButton.disabled = false; stopButton.disabled = true; timer.textContent = `${formatTime((performance.now() - recordingStarted) / 1000)} / 5:00`;
        try { await loadWorking(blob); } catch (error) { setStatus(error.message || 'The recording could not be decoded.', true); }
        if (activeController === controller) activeController = null;
      };
      recorder.onerror = () => setStatus('The recording could not be completed.', true);
      recorder.start(250); recordingStarted = performance.now(); startButton.disabled = true; stopButton.disabled = false; editor.hidden = true;
      setStatus('Recording…');
      try { await startLiveWaveform(stream); } catch { stopLiveWaveform(); }
      timerId = setInterval(() => { timer.textContent = `${formatTime((performance.now() - recordingStarted) / 1000)} / 5:00`; }, 250);
      limitTimer = setTimeout(() => { finishRecording(); setStatus('Recording stopped at the five-minute limit.'); }, AUDIO_MAX_DURATION_MS);
    } catch (error) { stream?.getTracks().forEach(track => track.stop()); stream = null; startButton.disabled = false; stopButton.disabled = true; setStatus(`Microphone access failed: ${error.message || error.name}`, true); }
  };
  const close = () => {
    if (recorder?.state === 'recording') { finishRecording(); setStatus('Recording stopped. Close again after processing.'); return; }
    dialog.hidden = true; player.pause(); selectionEnd = null;
  };
  const open = async() => {
    dialog.hidden = false; setStatus(savedBlob ? 'Loading saved audio…' : 'Ready to record.');
    if (savedBlob) { try { await loadWorking(savedBlob); } catch (error) { setStatus(error.message, true); } }
    else editor.hidden = true;
    requestAnimationFrame(() => startButton.focus());
  };
  const playSaved = () => {
    if (!savedBlob) return;
    if (!savedUrl) savedUrl = URL.createObjectURL(savedBlob);
    if (!outsideAudio.paused && outsideAudio.src === savedUrl) {
      outsideAudio.pause();
      outsidePlay.innerHTML = audioIcons.play;
      outsidePlay.title = 'Play recorded audio';
      return;
    }
    outsideAudio.src = savedUrl;
    outsideAudio.play().then(() => {
      outsidePlay.innerHTML = audioIcons.pause;
      outsidePlay.title = 'Pause recorded audio';
    }).catch(() => {});
  };

  recordButton.addEventListener('click', open); outsidePlay.addEventListener('click', playSaved);
  widget.querySelector('[data-audio-close]').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  const escape = event => { if (event.key === 'Escape' && !dialog.hidden) { event.preventDefault(); event.stopPropagation(); close(); } };
  document.addEventListener('keydown', escape, true);
  startButton.addEventListener('click', startRecording); stopButton.addEventListener('click', finishRecording);
  outsideAudio.addEventListener('ended', () => { outsidePlay.innerHTML = audioIcons.play; updateOutside(); });
  outsideAudio.addEventListener('pause', () => { outsidePlay.innerHTML = audioIcons.play; });
  widget.querySelector('[data-play-audio]').addEventListener('click', () => player.paused ? player.play() : player.pause());
  widget.querySelector('[data-play-selection]').addEventListener('click', () => { if (!selection) return; player.currentTime = selection.start; selectionEnd = selection.end; player.play(); });
  player.addEventListener('timeupdate', () => { cursorSeconds = player.currentTime; if (selectionEnd !== null && player.currentTime >= selectionEnd) { player.pause(); selectionEnd = null; } drawWaveform(waveform, workingBuffer, selection, cursorSeconds); });
  player.addEventListener('ended', () => { selectionEnd = null; });
  waveform.addEventListener('pointerdown', event => {
    if (!workingBuffer) return; waveform.setPointerCapture(event.pointerId);
    const box = waveform.getBoundingClientRect(); const start = Math.max(0, Math.min(workingBuffer.duration, (event.clientX - box.left) / box.width * workingBuffer.duration));
    waveform.dataset.dragStart = String(start); selection = { start, end: start }; cursorSeconds = start; updateEditor();
  });
  waveform.addEventListener('pointermove', event => {
    if (!workingBuffer || !waveform.hasPointerCapture(event.pointerId)) return;
    const box = waveform.getBoundingClientRect(); const current = Math.max(0, Math.min(workingBuffer.duration, (event.clientX - box.left) / box.width * workingBuffer.duration));
    const start = Number(waveform.dataset.dragStart); selection = { start: Math.min(start, current), end: Math.max(start, current) }; updateEditor();
  });
  waveform.addEventListener('pointerup', event => {
    if (!workingBuffer) return; waveform.releasePointerCapture(event.pointerId);
    if (selection && selection.end - selection.start < .01) selection = null;
    updateEditor();
  });
  widget.querySelector('[data-delete-selection]').addEventListener('click', () => { const range = selectedFrames(); if (!range || range.end - range.start >= workingBuffer.length) return setStatus('The entire recording cannot be deleted as a selection.', true); cursorSeconds = selection.start; applyEdit(deleteRange(audioContext, workingBuffer, range.start, range.end)); });
  widget.querySelector('[data-silence-selection]').addEventListener('click', () => { const range = selectedFrames(); if (range) applyEdit(silenceRange(audioContext, workingBuffer, range.start, range.end)); });
  widget.querySelectorAll('[data-insert-silence]').forEach(button => button.addEventListener('click', () => {
    if (!workingBuffer) return; const seconds = Math.min(10, Math.max(.1, Number(widget.querySelector('[data-pause-duration]').value) || 1));
    if (workingBuffer.duration + seconds > AUDIO_MAX_DURATION_MS / 1000) return setStatus('The edited recording cannot exceed five minutes.', true);
    const where = button.dataset.insertSilence; const positionSeconds = where === 'start' ? 0 : where === 'end' ? workingBuffer.duration : selection?.start ?? cursorSeconds;
    cursorSeconds = positionSeconds; applyEdit(insertSilence(audioContext, workingBuffer, Math.round(positionSeconds * workingBuffer.sampleRate), Math.round(seconds * workingBuffer.sampleRate)));
  }));
  widget.querySelector('[data-audio-undo]').addEventListener('click', () => { if (!undoStack.length) return; redoStack.push(workingBuffer); workingBuffer = undoStack.pop(); workingBlob = encodeWav(workingBuffer); edited = true; selection = null; setWorkingUrl(workingBlob); updateEditor(); setStatus('The last edit was undone.'); });
  widget.querySelector('[data-audio-redo]').addEventListener('click', () => { if (!redoStack.length) return; undoStack.push(workingBuffer); workingBuffer = redoStack.pop(); workingBlob = encodeWav(workingBuffer); edited = true; selection = null; setWorkingUrl(workingBlob); updateEditor(); setStatus('The edit was restored.'); });
  widget.querySelector('[data-audio-reset]').addEventListener('click', () => { if (!originalBuffer) return; undoStack.push(workingBuffer); workingBuffer = originalBuffer; workingBlob = encodeWav(workingBuffer); redoStack = []; edited = false; selection = null; setWorkingUrl(workingBlob); updateEditor(); setStatus('All edits were reset.'); });
  saveButton.addEventListener('click', () => save({ closeDialog: true })); deleteSavedButton.addEventListener('click', removeSaved);
  const redraw = () => drawWaveform(waveform, workingBuffer, selection, cursorSeconds);
  window.addEventListener('resize', redraw);

  updateOutside();
  const ready = Promise.resolve();

  const controller = {
    get blob() { return savedBlob; }, get durationMs() { return savedDurationMs; },
    ready, open, stopRecording: finishRecording, markTextChanged: updateOutside,
    async exportWav() {
      await ready;
      if (!savedBlob) return null;
      const buffer = await decode(savedBlob);
      return { blob: encodeWav(buffer), durationMs: Math.round(buffer.duration * 1000) };
    },
    async importAudio(blob) {
      await ready;
      await loadWorking(blob);
      await save();
    },
    async clearAudio() {
      await ready;
      await removeSaved();
      clearWorking();
    },
    destroy() { destroyed = true; document.removeEventListener('keydown', escape, true); window.removeEventListener('resize', redraw); finishRecording(); stream?.getTracks().forEach(track => track.stop()); stopLiveWaveform(); player.pause(); outsideAudio.pause(); outsideAudio.removeAttribute('src'); revoke(savedUrl); revoke(workingUrl); audioContext?.close().catch(() => {}); if (activeController === controller) activeController = null; },
  };
  return controller;
}
