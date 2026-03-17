import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Stethoscope, Star, Clock, DollarSign } from 'lucide-react';

interface Doctor {
  id: string;
  profile_id: string;
  specialization: string;
  bio: string;
  experience_years: number;
  consultation_fee: number;
  available: boolean;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from('doctor_profiles')
        .select('*, profile:profiles!doctor_profiles_profile_id_fkey(id, full_name, avatar_url)')
        .eq('available', true);
      if (data) setDoctors(data as any);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  return (
    <Layout>
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <FadeUp>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-4">
              Our <span className="gradient-text">Doctors</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              World-class healthcare professionals ready to help you.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <FadeUp className="text-center py-16">
              <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl mb-2">No doctors available yet</h3>
              <p className="text-muted-foreground">Doctors will appear here once they register and set up their profiles.</p>
            </FadeUp>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc, i) => (
                <FadeUp key={doc.id} delay={i * 0.1}>
                  <div className="glass-card p-6 hover-lift text-center">
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{doc.profile?.full_name || 'Doctor'}</h3>
                    <p className="text-sm text-primary font-medium">{doc.specialization}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{doc.bio || 'Experienced healthcare professional'}</p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.experience_years}y</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${doc.consultation_fee}</span>
                    </div>
                    <Link to={`/book/${doc.profile?.id}`}>
                      <Button className="mt-4 w-full gradient-primary btn-press border-0 text-primary-foreground">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
