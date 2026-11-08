import React, { useMemo } from 'react';
import { Cake, CalendarDays, ChevronRight } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';
import type { Patient } from '../../types';

interface BirthdayPatient {
  id: string;
  name: string;
  date: Date;
  age: number;
}

const getNextBirthday = (patient: Patient, today: Date): BirthdayPatient | null => {
  if (!patient.dob) return null;
  const parts = patient.dob.split(/[-/]/).map(Number);
  const [month, day, birthYear] = patient.dob.includes('-')
    ? [parts[1], parts[2], parts[0]]
    : parts;
  if (!month || !day || !birthYear) return null;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let birthday = new Date(today.getFullYear(), month - 1, day);
  if (birthday < todayStart) birthday = new Date(today.getFullYear() + 1, month - 1, day);
  const daysAway = Math.ceil((birthday.getTime() - todayStart.getTime()) / 86400000);
  if (daysAway > 30) return null;

  return {
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    date: birthday,
    age: birthday.getFullYear() - birthYear,
  };
};

export const PatientBirthdaysStrip: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const { patients } = useHealthcare();
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    return patients
      .filter((patient) => patient.serviceLine === 'home_health' && patient.status === 'active')
      .map((patient) => getNextBirthday(patient, today))
      .filter((patient): patient is BirthdayPatient => patient !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [patients]);

  return (
    <section className="overflow-hidden rounded-2xl border border-pearl-200 bg-white shadow-xs dark:border-charcoal-700 dark:bg-charcoal-850" aria-label="Upcoming patient birthdays">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3 lg:w-52 lg:border-r lg:border-pearl-200 lg:pr-5 dark:lg:border-charcoal-700">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"><Cake size={20} /></span>
          <span>
            <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Patient birthdays</span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Next 30 days</span>
          </span>
        </div>

        {upcomingBirthdays.length > 0 ? (
          <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {upcomingBirthdays.map((patient) => (
              <div key={patient.id} className="flex min-w-[190px] flex-1 items-center gap-3 rounded-xl border border-pearl-200 bg-pearl-50/70 px-3 py-2.5 dark:border-charcoal-700 dark:bg-charcoal-800/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-xs font-black text-white shadow-sm">
                  {patient.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{patient.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <CalendarDays size={12} className="shrink-0 text-rose-500" />
                    {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(patient.date)} · {patient.age} years
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex-1 py-2 text-sm text-slate-500 dark:text-slate-400">No Home Health birthdays in the next 30 days.</p>
        )}

        <button type="button" onClick={onViewAll} className="inline-flex shrink-0 items-center gap-1 self-end text-sm font-bold text-rose-700 transition hover:gap-2 hover:text-rose-800 dark:text-rose-300 lg:self-center">
          View patient roster <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};
