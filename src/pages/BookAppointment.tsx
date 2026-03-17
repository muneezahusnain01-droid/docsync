import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Stethoscope, Clock } from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    const fetchDoctor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*, doctor_profiles(*)')
        .eq('id', doctorId)
        .single();
      setDoctor(data);
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!date || !doctorId) return;
    const fetchBooked = async () => {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await supabase
        .from('appointments')
        .select('time_slot')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');
      setBookedSlots(data?.map(a => a.time_slot) || []);
    };
    fetchBooked();
  }, [date, doctorId]);

  const handleBook = async () => {
    if (!profile || !date || !selectedSlot || !doctorId) {
      toast.error('Please sign in and select a date and time');
      return;
    }
    if (profile.role !== 'patient') {
      toast.error('Only patients can book appointments');
      return;
    }
    setSubmitting(true);
    const meetingLink = `https://meet.docsync.health/${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase.from('appointments').insert({
      patient_id: profile.id,
      doctor_id: doctorId,
      appointment_date: date.toISOString().split('T')[0],
      time_slot: selectedSlot,
      meeting_link: meetingLink,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') toast.error('This slot is already booked');
      else toast.error(error.message);
      return;
    }
    toast.success('Appointment booked successfully!');
    navigate('/dashboard/patient');
  };

  return (
    <Layout>
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeUp>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-center">
              Book <span className="gradient-text">Appointment</span>
            </h1>
          </FadeUp>

          {doctor && (
            <FadeUp delay={0.1}>
              <div className="glass-card-elevated p-6 mt-8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Stethoscope className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">{doctor.full_name}</h2>
                  <p className="text-sm text-primary">{doctor.doctor_profiles?.[0]?.specialization || 'General'}</p>
                  <p className="text-sm text-muted-foreground">Fee: ${doctor.doctor_profiles?.[0]?.consultation_fee || 0}</p>
                </div>
              </div>
            </FadeUp>
          )}

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <FadeUp delay={0.2}>
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date() || d.getDay() === 0}
                  className="rounded-xl"
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Select Time</h3>
                {date ? (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button key={slot} disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all btn-press flex items-center justify-center gap-1 ${
                            isBooked ? 'bg-muted text-muted-foreground/50 cursor-not-allowed' :
                            selectedSlot === slot ? 'gradient-primary text-primary-foreground glow-primary' :
                            'border border-border hover:border-primary hover:text-primary'
                          }`}>
                          <Clock className="w-3 h-3" /> {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Please select a date first</p>
                )}

                <Button onClick={handleBook} disabled={!date || !selectedSlot || submitting}
                  className="w-full mt-6 gradient-primary btn-press border-0 text-primary-foreground">
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </Layout>
  );
}
