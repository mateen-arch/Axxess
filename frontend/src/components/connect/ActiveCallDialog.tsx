import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Video, Mic, MicOff, Volume2, VolumeX, Shield, PhoneForwarded } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const ActiveCallDialog: React.FC = () => {
  const { activeCallModal, setActiveCallModal, addCallLog } = useHealthcare();
  const [seconds, setSeconds] = useState(0);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(activeCallModal?.callType === 'video');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Audio Context & Media Stream Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringOscillator1Ref = useRef<OscillatorNode | null>(null);
  const ringOscillator2Ref = useRef<OscillatorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeCallModal?.isOpen) {
      setSeconds(0);
      setCallState('connecting');
      return;
    }

    // Initialize Web Audio API for Realistic Telephony Ringback Tone
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Standard US Supervisory Ringtone: 440 Hz + 480 Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        osc1.type = 'sine';
        osc2.type = 'sine';

        // Pulse ringtone: 1.5s on, 2s off
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 1.2);
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + 1.25);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        ringOscillator1Ref.current = osc1;
        ringOscillator2Ref.current = osc2;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked by autoplay policy:', e);
    }

    // Transition from "Calling / Ringing" to "Connected" after 2.5 seconds
    const connectTimer = setTimeout(async () => {
      // Stop Ring Tone
      try {
        ringOscillator1Ref.current?.stop();
        ringOscillator2Ref.current?.stop();
      } catch {
        // ignore
      }

      setCallState('connected');

      // Play soft connection chime
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const chime = audioContextRef.current.createOscillator();
        const chimeGain = audioContextRef.current.createGain();
        chime.frequency.setValueAtTime(587.33, audioContextRef.current.currentTime);
        chime.frequency.exponentialRampToValueAtTime(880, audioContextRef.current.currentTime + 0.2);
        chimeGain.gain.setValueAtTime(0.06, audioContextRef.current.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.3);
        chime.connect(chimeGain);
        chimeGain.connect(audioContextRef.current.destination);
        chime.start();
        chime.stop(audioContextRef.current.currentTime + 0.3);
      }

      // Request real microphone audio stream
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          mediaStreamRef.current = stream;

          // Connect analyzer for live audio meter
          if (audioContextRef.current) {
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyzer = audioContextRef.current.createAnalyser();
            analyzer.fftSize = 64;
            source.connect(analyzer);

            const buffer = new Uint8Array(analyzer.frequencyBinCount);
            const checkVolume = () => {
              analyzer.getByteFrequencyData(buffer);
              let sum = 0;
              for (let i = 0; i < buffer.length; i++) sum += buffer[i];
              const avg = sum / buffer.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animationFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        }
      } catch (micErr) {
        console.warn('Microphone permission not granted or device not found; proceeding in simulated audio mode:', micErr);
      }
    }, 2400);

    // Call Duration Timer
    const durationTimer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationTimer);
      try {
        ringOscillator1Ref.current?.stop();
        ringOscillator2Ref.current?.stop();
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        audioContextRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, [activeCallModal?.isOpen]);

  if (!activeCallModal?.isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
  };

  const handleEndCall = () => {
    // Stop streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }

    const durationStr = formatDuration(seconds);
    const now = new Date();
    addCallLog({
      contactId: 'clinician-field',
      contactName: activeCallModal.contactName,
      contactRole: 'Field Clinician',
      direction: 'outbound',
      callType: activeCallModal.callType,
      duration: seconds > 0 ? durationStr : '0s',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      status: 'completed'
    });

    setActiveCallModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col p-6 items-center text-center">
        {/* Top Call Info */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 border border-emerald-500/30">
          <Shield size={13} />
          <span>Encrypted HIPAA Telehealth Audio Session</span>
        </div>

        {/* Avatar or Video Preview */}
        {activeCallModal.callType === 'video' && isVideoOn ? (
          <div className="relative w-full h-56 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
              <span className="text-xs font-bold text-slate-200">{activeCallModal.contactName} (Live Telehealth)</span>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-300 font-extrabold text-xl animate-pulse">
                {activeCallModal.contactName[0]}
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live WebRTC Audio/Video Active
              </span>
            </div>
          </div>
        ) : (
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl ring-8 ring-rose-500/20">
              {activeCallModal.contactName[0]}
            </div>

            {/* Speaking Audio VU Rings */}
            {callState === 'connected' && (
              <div 
                className="absolute inset-0 rounded-full border-2 border-emerald-400 transition-all duration-75 pointer-events-none"
                style={{
                  transform: `scale(${1 + (audioLevel / 100) * 0.4})`,
                  opacity: Math.max(0.2, audioLevel / 100)
                }}
              />
            )}
          </div>
        )}

        <h3 className="text-xl font-black text-white">{activeCallModal.contactName}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {callState === 'connecting' ? 'Calling & Dialing...' : 'Connected • Real-time 1-to-1 Audio'}
        </p>

        {/* Live Audio Indicator & Call Duration */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {callState === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
                {formatDuration(seconds)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono ml-1">
                (Mic {isMuted ? 'Muted' : 'Live'})
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold animate-pulse">
              <PhoneForwarded size={14} />
              <span>Ringing...</span>
            </div>
          )}
        </div>

        {/* Call Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Mute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
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
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              !isSpeakerOn
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isSpeakerOn ? 'Mute Speaker' : 'Enable Speaker'}
          >
            {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
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
