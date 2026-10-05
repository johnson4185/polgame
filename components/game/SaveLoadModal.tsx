'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { 
  getSlotMetadata, 
  SaveMetadata, 
  exportSaveToFile, 
  parseSaveFile 
} from '@/lib/game/simulation/persistence';
import { X, Download, Upload, Check, AlertCircle, Save, Database } from 'lucide-react';

interface SaveLoadModalProps {
  onClose: () => void;
}

const getInitialSlots = () => [
  { id: 'autosave', meta: getSlotMetadata('autosave') },
  { id: '1', meta: getSlotMetadata('1') },
  { id: '2', meta: getSlotMetadata('2') },
  { id: '3', meta: getSlotMetadata('3') },
];

export function SaveLoadModal({ onClose }: SaveLoadModalProps) {
  const { state, dispatch, saveCurrentGame, loadSavedGame } = useGame();
  const [slots, setSlots] = useState<{ id: string; meta: SaveMetadata | null }[]>(getInitialSlots);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshSlots = () => {
    setSlots(getInitialSlots());
  };

  const handleSaveSlot = (slotId: string) => {
    const ok = saveCurrentGame(slotId);
    if (ok) {
      setFeedback(`Campaign successfully saved to Slot ${slotId}`);
      refreshSlots();
    } else {
      setFeedback(`Failed to save to Slot ${slotId}`);
    }
  };

  const handleLoadSlot = (slotId: string) => {
    const ok = loadSavedGame(slotId);
    if (ok) {
      setFeedback(`Campaign state loaded successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setFeedback(`No valid save found in Slot ${slotId}`);
    }
  };

  const handleExport = () => {
    exportSaveToFile(state);
    setFeedback('Save file exported to downloads');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSaveFile(content);
      if (parsed) {
        dispatch({ type: 'LOAD_STATE', state: parsed });
        setFeedback('Save file imported and loaded!');
        setTimeout(() => onClose(), 800);
      } else {
        setFeedback('Invalid or incompatible save file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inset p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xs border-2 border-line-strong bg-surface p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b-2 border-line pb-3">
          <div>
            <h2 className="font-display text-base font-bold text-fg flex items-center gap-2">
              <Database className="h-4 w-4 text-accent-fg" />
              <span>CAMPAIGN ARCHIVE &amp; SAVE CHECKPOINTS</span>
            </h2>
            <p className="text-xs text-muted font-sans mt-0.5">Manage encrypted localStorage slots or export/import JSON checkpoint</p>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-fg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div className="my-2 flex items-center gap-2 rounded-xs bg-accent-soft border border-accent px-3.5 py-2 text-xs font-bold text-accent-fg">
            <Check className="h-4 w-4 text-accent-fg" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Slot List */}
        <div className="space-y-2">
          {slots.map((slot) => {
            const hasData = !!slot.meta;
            const isAutosave = slot.id === 'autosave';

            return (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xs border-2 border-line bg-inset p-3 font-tactical text-xs hover:border-line-strong transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-black text-fg">
                      {isAutosave ? 'AUTOSAVE BUFFER' : `SAVE SLOT #${slot.id}`}
                    </span>
                    {hasData && (
                      <span className="stamp-yellow text-[8px]">
                        {slot.meta?.inGameDate}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 font-sans">
                    {hasData ? (
                      <span>{slot.meta?.name} · Saved {slot.meta?.savedAt}</span>
                    ) : (
                      <span className="text-faint">Empty Save Slot</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {!isAutosave && (
                    <button
                      onClick={() => handleSaveSlot(slot.id)}
                      className="rounded-xs border border-line-strong bg-raised px-3 py-1 font-bold text-fg hover:bg-[#FACC15] hover:text-black hover:border-accent transition-colors"
                    >
                      Save
                    </button>
                  )}
                  {hasData && (
                    <button
                      onClick={() => handleLoadSlot(slot.id)}
                      className="rounded-xs bg-[#DC2626] border border-red-500 px-3 py-1 font-black text-white hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Load
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Export / Import */}
        <div className="border-t-2 border-line pt-3 flex items-center justify-between gap-3 text-xs font-tactical">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xs border-2 border-line-strong bg-inset px-3.5 py-2 font-black text-fg hover:border-accent hover:text-accent-fg transition-colors"
          >
            <Download className="h-4 w-4 text-accent-fg" />
            <span>Export Campaign JSON</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xs border-2 border-line-strong bg-inset px-3.5 py-2 font-black text-fg hover:border-[#DC2626] hover:text-danger-fg transition-colors cursor-pointer">
            <Upload className="h-4 w-4 text-danger-fg" />
            <span>Import Save File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
