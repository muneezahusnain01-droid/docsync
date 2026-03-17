import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Pill, Video, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [appts, rxs] = await Promise.all([
        supabase.from('appointments').select('*, doctor:profiles!appointments_doctor_id_fkey(full_name)').eq('patient_id', profile.id).order('appointment_date', { ascending: false }),
        supabase.from('prescriptions').select('*, doctor:profiles!prescriptions_doctor_id_fkey(full_name)').eq('patient_id', profile.id).order('created_at', { ascending: false }),
      ]);
      setAppointments(appts.data || []);
      setPrescriptions(rxs.data || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  if (!profile) return <Layout><div className="py-24 text-center text-muted-foreground">Please sign in</div></Layout>;

  return (
    <Layout>
      <div className="py-24 gradient-hero min-h-screen">
        <div className="container mx-auto px-4">
          <FadeUp>
            <h1 className="font-display font-extrabold text-3xl mb-2">
              Welcome, <span className="gradient-text">{profile.full_name || 'Patient'}</span>
            </h1>
            <p className="text-muted-foreground mb-8">Manage your health from one place</p>
          </FadeUp>

          {/* Quick actions */}
          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Link to="/doctors" className="glass-card p-4 text-center hover-lift">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium">Book</span>
              </Link>
              <Link to="/pharmacy" className="glass-card p-4 text-center hover-lift">
                <Pill className="w-6 h-6 text-secondary mx-auto mb-2" />
                <span className="text-sm font-medium">Pharmacy</span>
              </Link>
              <div className="glass-card p-4 text-center">
                <FileText className="w-6 h-6 text-accent mx-auto mb-2" />
                <span className="text-sm font-medium">Prescriptions</span>
              </div>
              <div className="glass-card p-4 text-center">
                <User className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium">Profile</span>
              </div>
            </div>
          </FadeUp>

          {/* Appointments */}
          <FadeUp delay={0.2}>
            <div className="glass-card-elevated p-6 mb-8">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Appointments
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet. <Link to="/doctors" className="text-primary hover:underline">Book one now</Link></p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <p className="font-medium">{apt.doctor?.full_name || 'Doctor'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {apt.appointment_date} at {apt.time_slot}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          apt.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                          apt.status === 'completed' ? 'bg-secondary/10 text-secondary' :
                          'bg-destructive/10 text-destructive'
                        }`}>{apt.status}</span>
                        {apt.meeting_link && apt.status === 'scheduled' && (
                          <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1"><Video className="w-3 h-3" /> Join</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeUp>

          {/* Prescriptions */}
          <FadeUp delay={0.3}>
            <div className="glass-card-elevated p-6">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Prescriptions
              </h2>
              {prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-4 rounded-xl bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{rx.medication}</p>
                          <p className="text-sm text-muted-foreground">By {rx.doctor?.full_name || 'Doctor'}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(rx.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-2">
                        <span>Dosage: {rx.dosage}</span>
                        <span>Freq: {rx.frequency}</span>
                        <span>Duration: {rx.duration}</span>
                      </div>
                      {rx.instructions && <p className="text-xs text-muted-foreground mt-2 italic">{rx.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </Layout>
  );
}
