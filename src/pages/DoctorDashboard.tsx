import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, Users, Video, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rxOpen, setRxOpen] = useState(false);
  const [rxForm, setRxForm] = useState({ patient_id: '', medication: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '', diagnosis: '', appointment_id: '' });

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [appts, dp] = await Promise.all([
        supabase.from('appointments').select('*, patient:profiles!appointments_patient_id_fkey(full_name)').eq('doctor_id', profile.id).order('appointment_date', { ascending: false }),
        supabase.from('doctor_profiles').select('*').eq('profile_id', profile.id).single(),
      ]);
      setAppointments(appts.data || []);
      if (dp.data) setDoctorProfile(dp.data);
      else {
        // Auto-create doctor profile
        await supabase.from('doctor_profiles').insert({ profile_id: profile.id });
        const { data } = await supabase.from('doctor_profiles').select('*').eq('profile_id', profile.id).single();
        setDoctorProfile(data);
      }
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Appointment ${status}`);
  };

  const createPrescription = async () => {
    if (!profile) return;
    const { error } = await supabase.from('prescriptions').insert({
      doctor_id: profile.id,
      patient_id: rxForm.patient_id,
      appointment_id: rxForm.appointment_id || null,
      medication: rxForm.medication,
      dosage: rxForm.dosage,
      frequency: rxForm.frequency,
      duration: rxForm.duration,
      instructions: rxForm.instructions,
      diagnosis: rxForm.diagnosis,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Prescription created');
    setRxOpen(false);
    setRxForm({ patient_id: '', medication: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '', diagnosis: '', appointment_id: '' });
  };

  if (!profile) return <Layout><div className="py-24 text-center text-muted-foreground">Please sign in</div></Layout>;

  const patients = [...new Map(appointments.map(a => [a.patient_id, { id: a.patient_id, name: a.patient?.full_name || 'Patient' }])).values()];

  return (
    <Layout>
      <div className="py-24 gradient-hero min-h-screen">
        <div className="container mx-auto px-4">
          <FadeUp>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="font-display font-extrabold text-3xl">
                  Dr. <span className="gradient-text">{profile.full_name || 'Doctor'}</span>
                </h1>
                <p className="text-muted-foreground">Manage your practice</p>
              </div>
              <Dialog open={rxOpen} onOpenChange={setRxOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary btn-press border-0 text-primary-foreground gap-2">
                    <Plus className="w-4 h-4" /> New Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card-elevated">
                  <DialogHeader>
                    <DialogTitle className="font-display">Create Prescription</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Patient</Label>
                      <Select value={rxForm.patient_id} onValueChange={v => setRxForm(p => ({ ...p, patient_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                        <SelectContent>
                          {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Diagnosis</Label>
                      <Input value={rxForm.diagnosis} onChange={e => setRxForm(p => ({ ...p, diagnosis: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Medication</Label>
                        <Input value={rxForm.medication} onChange={e => setRxForm(p => ({ ...p, medication: e.target.value }))} required />
                      </div>
                      <div>
                        <Label>Dosage</Label>
                        <Input value={rxForm.dosage} onChange={e => setRxForm(p => ({ ...p, dosage: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Frequency</Label>
                        <Input value={rxForm.frequency} onChange={e => setRxForm(p => ({ ...p, frequency: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input value={rxForm.duration} onChange={e => setRxForm(p => ({ ...p, duration: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Instructions</Label>
                      <Textarea value={rxForm.instructions} onChange={e => setRxForm(p => ({ ...p, instructions: e.target.value }))} />
                    </div>
                    <Button onClick={createPrescription} className="w-full gradient-primary btn-press border-0 text-primary-foreground">
                      Create Prescription
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.1}>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                <div className="font-display font-bold text-2xl">{appointments.filter(a => a.status === 'scheduled').length}</div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Users className="w-6 h-6 text-secondary mx-auto mb-1" />
                <div className="font-display font-bold text-2xl">{patients.length}</div>
                <div className="text-xs text-muted-foreground">Patients</div>
              </div>
              <div className="glass-card p-4 text-center">
                <FileText className="w-6 h-6 text-accent mx-auto mb-1" />
                <div className="font-display font-bold text-2xl">{appointments.filter(a => a.status === 'completed').length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </FadeUp>

          {/* Appointments */}
          <FadeUp delay={0.2}>
            <div className="glass-card-elevated p-6">
              <h2 className="font-display font-bold text-xl mb-4">Appointments</h2>
              {loading ? (
                <div className="animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}</div>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 flex-wrap gap-2">
                      <div>
                        <p className="font-medium">{apt.patient?.full_name || 'Patient'}</p>
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
                        {apt.status === 'scheduled' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, 'completed')}>Complete</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</Button>
                            {apt.meeting_link && (
                              <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gap-1 gradient-primary border-0 text-primary-foreground"><Video className="w-3 h-3" /> Join</Button>
                              </a>
                            )}
                          </>
                        )}
                      </div>
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
