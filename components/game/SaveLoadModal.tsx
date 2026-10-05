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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xs border-2 border-zinc-700 bg-[#0C101A] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <div>
            <h2 className="font-tactical text-base font-black text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-[#FACC15]" />
              <span>CAMPAIGN ARCHIVE &amp; SAVE CHECKPOINTS</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">Manage encrypted localStorage slots or export/import JSON checkpoint</p>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div className="my-2 flex items-center gap-2 rounded-xs bg-yellow-950/80 border border-[#FACC15] px-3.5 py-2 text-xs font-bold text-[#FDE047]">
            <Check className="h-4 w-4 text-[#FACC15]" />
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
                className="flex items-center justify-between rounded-xs border-2 border-zinc-800 bg-black/80 p-3 font-tactical text-xs hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">
                      {isAutosave ? 'AUTOSAVE BUFFER' : `SAVE SLOT #${slot.id}`}
                    </span>
                    {hasData && (
                      <span className="stamp-yellow text-[8px]">
                        {slot.meta?.inGameDate}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                    {hasData ? (
                      <span>{slot.meta?.name} · Saved {slot.meta?.savedAt}</span>
                    ) : (
                      <span className="text-zinc-600">Empty Save Slot</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isAutosave && (
                    <button
                      onClick={() => handleSaveSlot(slot.id)}
                      className="rounded-xs border border-zinc-700 bg-zinc-900 px-3 py-1 font-bold text-zinc-200 hover:bg-[#FACC15] hover:text-black hover:border-[#FACC15] transition-colors"
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
        <div className="border-t-2 border-zinc-800 pt-3 flex items-center justify-between gap-3 text-xs font-tactical">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xs border-2 border-zinc-700 bg-black px-3.5 py-2 font-black text-zinc-200 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors"
          >
            <Download className="h-4 w-4 text-[#FACC15]" />
            <span>Export Campaign JSON</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xs border-2 border-zinc-700 bg-black px-3.5 py-2 font-black text-zinc-200 hover:border-[#DC2626] hover:text-[#DC2626] transition-colors cursor-pointer">
            <Upload className="h-4 w-4 text-[#DC2626]" />
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
