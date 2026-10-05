'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import type { GameState } from '@/lib/game/types';
import {
  describeSave, exportSaveToFile, exportSlotToFile, inspectSaveSlot, MAX_SAVE_FILE_BYTES,
  normalizeSaveName, parseSaveFile, renameSaveSlot, SAVE_NAME_LIMIT, saveGameToSlot,
} from '@/lib/game/simulation/persistence';
import { Button } from '@/components/ui/primitives';
import { GameDialog, Tabs, TabPanel } from '@/components/ui/menus';
import { SavePreview } from '@/components/saves/SavePreview';

const SLOT_IDS = ['autosave', '1', '2', '3'];
const readSlots = () => SLOT_IDS.map(id => ({ id, ...inspectSaveSlot(id) }));
type Feedback = { text: string; error: boolean };

export function SaveLoadModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, loadSavedGame } = useGame();
  const [slots, setSlots] = useState(readSlots);
  const [selected, setSelected] = useState('1');
  const [names, setNames] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [overwrite, setOverwrite] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<{ state: GameState; filename: string } | null>(null);
  const [reading, setReading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef({ generation: 0 });
  const refresh = () => setSlots(readSlots());
  const report = (text: string, error = false) => setFeedback({ text, error });

  useEffect(() => {
    const lifecycle = request.current;
    const timer = setInterval(() => setSlots(readSlots()), 5000);
    const sync = () => setSlots(readSlots());
    window.addEventListener('storage', sync);
    return () => { clearInterval(timer); window.removeEventListener('storage', sync); lifecycle.generation++; };
  }, []);

  const save = (slotId: string) => {
    const slot = slots.find(item => item.id === slotId)!;
    const name = normalizeSaveName(names[slotId] ?? slot.meta?.name, `Slot ${slotId}`);
    const ok = saveGameToSlot(slotId, state, name);
    setOverwrite(null);
    if (ok) { setNames(previous => ({ ...previous, [slotId]: name })); refresh(); }
    report(ok ? `Saved “${name}”.` : 'Could not save. Browser storage may be full or unavailable. Download a backup instead.', !ok);
  };

  const load = (slotId: string) => {
    if (loadSavedGame(slotId)) onClose();
    else { refresh(); report('This checkpoint could not be loaded. It may be damaged or from a newer game version.', true); }
  };

  const rename = (slotId: string) => {
    const name = normalizeSaveName(names[slotId], `Slot ${slotId}`);
    const ok = renameSaveSlot(slotId, name);
    if (ok) { setNames(previous => ({ ...previous, [slotId]: name })); refresh(); }
    report(ok ? `Renamed checkpoint to “${name}”.` : 'Could not rename this checkpoint. The campaign was not replaced.', !ok);
  };

  const download = (savedState: GameState, name?: string) => {
    const ok = exportSaveToFile(savedState, name);
    report(ok ? 'Download requested. Check your browser’s downloads.' : 'The download could not be started. Please try again.', !ok);
  };

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const token = ++request.current.generation;
    setIncoming(null); setFeedback(null); setOverwrite(null);
    if (file.size > MAX_SAVE_FILE_BYTES) { setReading(false); report('Choose a campaign JSON file smaller than 5 MB.', true); return; }
    setReading(true);
    try {
      const text = await file.text();
      if (request.current.generation !== token) return;
      const parsed = parseSaveFile(text);
      if (!parsed) report('This is not a supported campaign save. Choose an original JSON backup from this game; newer-version saves need the newer game.', true);
      else setIncoming({ state: parsed, filename: file.name });
    } catch { if (request.current.generation === token) report('Could not read that file. Please try again.', true); }
    finally { if (request.current.generation === token) setReading(false); }
  };

  return (
    <GameDialog open onOpenChange={open => { if (!open) onClose(); }} title="Save & load" size="md">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-fg-2">Keep named checkpoints in this browser, or download a JSON backup to take with you. Browser saves are not encrypted.</p>
        {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`break-words rounded-lg border p-3 text-sm ${feedback.error ? 'border-danger-line bg-danger-soft text-danger-fg' : 'border-success-line bg-success-soft text-success-fg'}`}>{feedback.text}</p>}
        {incoming ? (
          <section aria-label="Import preview" className="chunky-sm space-y-3 bg-inset p-3">
            <h3 className="font-display text-sm">Review your backup</h3>
            <p className="break-all text-xs text-muted">{incoming.filename}</p>
            <SavePreview meta={describeSave(incoming.state, 'import', incoming.filename)} />
            <p className="text-sm text-fg-2">Loading replaces your current unsaved progress. Named checkpoints stay unchanged; autosave will follow the loaded campaign.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => { dispatch({ type: 'LOAD_STATE', state: incoming.state }); onClose(); }}>Load backup</Button>
              <Button size="sm" variant="secondary" onClick={() => setIncoming(null)}>Cancel</Button>
            </div>
          </section>
        ) : (
          <Tabs value={selected} onValueChange={value => { setSelected(value); setOverwrite(null); }} size="sm"
            tabs={SLOT_IDS.map(id => ({ value: id, label: id === 'autosave' ? 'Auto' : `Slot ${id}` }))}>
            {slots.map(slot => {
              const automatic = slot.id === 'autosave';
              const name = names[slot.id] ?? slot.meta?.name ?? `Slot ${slot.id}`;
              return (
                <TabPanel key={slot.id} value={slot.id}>
                  <section aria-label={automatic ? 'Autosave checkpoint' : `Checkpoint slot ${slot.id}`} className="chunky-sm min-w-0 space-y-3 bg-inset p-3">
                    <h3 className="break-words font-bold text-fg">{slot.meta?.name ?? (automatic ? 'Autosave' : `Slot ${slot.id}`)}</h3>
                    {slot.meta ? <SavePreview meta={slot.meta} /> : <p className="text-sm text-muted">{
                      slot.status === 'empty' ? 'Empty checkpoint. Save your current campaign here.' :
                      slot.status === 'unavailable' ? 'Browser storage is unavailable. You can still download your current campaign.' :
                      'This slot contains a checkpoint that cannot be read by this version. Replacing it will overwrite that checkpoint.'
                    }</p>}
                    {automatic ? <p className="text-xs text-muted">Updates automatically every 20 seconds during a campaign.</p> : <label className="block text-sm font-bold" htmlFor={`save-name-${slot.id}`}>
                      Checkpoint name
                      <input id={`save-name-${slot.id}`} value={name} maxLength={SAVE_NAME_LIMIT}
                        onChange={event => { setNames(previous => ({ ...previous, [slot.id]: event.target.value })); setOverwrite(null); }}
                        className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border-2 border-ink bg-surface px-3 text-fg" />
                    </label>}
                    {overwrite === slot.id ? <div className="space-y-2 rounded-lg border border-danger-line bg-danger-soft p-3 text-danger-fg">
                      <p className="break-words text-sm">Replace “{slot.meta?.name ?? `Slot ${slot.id}`}” with your current campaign? Download the checkpoint first if you want to keep it.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" onClick={() => save(slot.id)}>Replace</Button>
                        <Button size="sm" variant="secondary" onClick={() => setOverwrite(null)}>Cancel</Button>
                      </div>
                    </div> : <div className="grid grid-cols-2 gap-2">
                      {!automatic && <Button size="sm" disabled={slot.status === 'unavailable'} onClick={() => {
                        const latest = inspectSaveSlot(slot.id);
                        if (latest.status === 'empty') save(slot.id); else { refresh(); setOverwrite(slot.id); }
                      }}>Save here</Button>}
                      {slot.meta && <Button size="sm" variant="secondary" onClick={() => load(slot.id)}>Load</Button>}
                      {!automatic && slot.meta && <Button size="sm" variant="secondary" disabled={normalizeSaveName(name, `Slot ${slot.id}`) === slot.meta.name} onClick={() => rename(slot.id)}>Rename</Button>}
                    </div>}
                    {(slot.status === 'ready' || slot.status === 'unreadable') && <Button size="sm" variant="secondary" className="w-full" icon={Download} onClick={() => {
                      const ok = exportSlotToFile(slot.id);
                      report(ok ? 'Checkpoint download requested. Check your browser’s downloads.' : 'Could not download this checkpoint.', !ok);
                    }}>Download checkpoint</Button>}
                    {slot.meta && <p className="text-xs text-muted">Loading replaces current unsaved progress. Other named checkpoints stay unchanged.</p>}
                  </section>
                </TabPanel>
              );
            })}
          </Tabs>
        )}
        <div className="space-y-3 border-t-2 border-ink pt-3">
          <h3 className="font-display text-sm">Portable backups</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button size="sm" variant="secondary" icon={Download} onClick={() => download(state, 'current-campaign')}>Download current</Button>
            <Button size="sm" variant="secondary" icon={Upload} disabled={reading} onClick={() => fileInput.current?.click()}>{reading ? 'Reading…' : 'Choose backup'}</Button>
          </div>
          <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Choose campaign JSON backup" className="hidden" onChange={importFile} />
          <p className="text-xs text-muted">Backups contain the campaign state. Browser-only statistics history is not included. Imported files are previewed before loading.</p>
        </div>
      </div>
    </GameDialog>
  );
}
