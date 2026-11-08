import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, Mic, MicOff, Volume2, Shield } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const ActiveCallDialog: React.FC = () => {
  const { activeCallModal, setActiveCallModal, addCallLog } = useHealthcare();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(activeCallModal?.callType === 'video');

  useEffect(() => {
    if (!activeCallModal?.isOpen) {
      setSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCallModal?.isOpen]);

  if (!activeCallModal?.isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    const durationStr = formatDuration(seconds);
    addCallLog({
      contactId: 'call-ended',
      contactName: activeCallModal.contactName,
      contactRole: 'Field Clinician',
      direction: 'outbound',
      callType: activeCallModal.callType,
      duration: durationStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      status: 'completed'
    });

    setActiveCallModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col p-6 items-center text-center">
        {/* Top Call Info */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 border border-emerald-500/30">
          <Shield size={13} />
          <span>Encrypted HIPAA Telehealth Call</span>
        </div>

        {/* Avatar or Video Preview */}
        {activeCallModal.callType === 'video' && isVideoOn ? (
          <div className="relative w-full h-56 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
              <span className="text-xs font-bold text-slate-200">{activeCallModal.contactName} (Live Video)</span>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-300 font-extrabold text-xl animate-pulse">
                {activeCallModal.contactName[0]}
              </div>
              <span className="text-xs text-slate-400 font-mono">Simulating WebRTC Stream</span>
            </div>
          </div>
        ) : (
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl ring-8 ring-rose-500/20 animate-pulse">
              {activeCallModal.contactName[0]}
            </div>
          </div>
        )}

        <h3 className="text-xl font-black text-white">{activeCallModal.contactName}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {activeCallModal.callType === 'video' ? 'Secure Telehealth Video Call' : 'Axxess Direct Voice Call'}
        </p>

        {/* Live Call Duration */}
        <div className="mt-3 font-mono text-sm font-bold text-emerald-400 tracking-wider">
          {formatDuration(seconds)}
        </div>

        {/* Call Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Mute Button */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Video */}
          <button
            type="button"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              !isVideoOn
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <Video size={20} />
          </button>

          {/* Speaker Button */}
          <button
            type="button"
            className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Speakerphone"
          >
            <Volume2 size={20} />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all cursor-pointer ring-4 ring-rose-500/20"
            title="End Call"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

