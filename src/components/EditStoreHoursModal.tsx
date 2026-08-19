/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Clock, Check, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { StoreHours } from '../types';

interface EditStoreHoursModalProps {
  storeHours: StoreHours;
  onSave: (updated: StoreHours) => void;
  onClose: () => void;
}

export default function EditStoreHoursModal({
  storeHours,
  onSave,
  onClose
}: EditStoreHoursModalProps) {
  const [openDays, setOpenDays] = useState(storeHours.openDays || 'Senin - Sabtu');
  const [openTime, setOpenTime] = useState(storeHours.openTime || '08:00');
  const [closeTime, setCloseTime] = useState(storeHours.closeTime || '20:00');
  const [closedDaysInfo, setClosedDaysInfo] = useState(storeHours.closedDaysInfo || 'Minggu & Hari Libur Tutup');
  const [timezone, setTimezone] = useState(storeHours.timezone || 'WIB');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      openDays,
      openTime,
      closeTime,
      closedDaysInfo,
      timezone
    });
    onClose();
  };

  return (
    <motion.div
      id="edit-store-hours-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <motion.div
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Atur Jam Operasional Toko</h3>
              <p className="text-xs text-slate-400">Pengaturan jadwal buka & tutup toko</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Hari Operasional (Hari Buka)
            </label>
            <input
              type="text"
              value={openDays}
              onChange={(e) => setOpenDays(e.target.value)}
              placeholder="Contoh: Senin - Sabtu, Setiap Hari"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Jam Buka
              </label>
              <input
                type="text"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                placeholder="08:00"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Jam Tutup
              </label>
              <input
                type="text"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                placeholder="20:00"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Zona Waktu
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="WIB / WITA / WIT"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Info Hari Libur / Tutup
              </label>
              <input
                type="text"
                value={closedDaysInfo}
                onChange={(e) => setClosedDaysInfo(e.target.value)}
                placeholder="Minggu & Hari Libur Tutup"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview Badge */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">
              Hasil Tampilan di Header & Toko:
            </span>
            <div className="text-xs font-bold text-white">
              {openDays}: {openTime} - {closeTime} {timezone}
            </div>
            <div className="text-[10px] text-slate-400">{closedDaysInfo}</div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-4 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-5 shadow-md transition"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Jam Operasional</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
