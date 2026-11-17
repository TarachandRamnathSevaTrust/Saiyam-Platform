import { supabase, isSupabaseConfigured } from './supabase';
import {
  School,
  Student,
  Question,
  PaperType,
  AssessmentRecord,
  SessionLog,
} from '@saiyam/shared';

/**
 * Saiyam Data Service Layer:
 * Automatically uses Supabase PostgreSQL when credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * are provided in the environment. Otherwise, seamlessly maintains offline/local storage state.
 */

export const apiService = {
  // Check if live Supabase backend is connected
  isConnected(): boolean {
    return isSupabaseConfigured;
  },

  // --- SCHOOLS ---
  async getSchools(): Promise<School[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        village: row.village,
        taluka: row.taluka,
        district: row.district,
        pinCode: row.pin_code,
        programStartDate: row.program_start_date,
        representativeName: row.representative_name,
        representativeContact: row.representative_contact,
        assignedTrainerId: row.assigned_trainer_id,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetch schools error:', err);
      return null;
    }
  },

  async createSchool(school: Omit<School, 'id' | 'createdAt'>): Promise<School | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: school.name,
          village: school.village,
          taluka: school.taluka,
          district: school.district,
          pin_code: school.pinCode,
          program_start_date: school.programStartDate,
          representative_name: school.representativeName,
          representative_contact: school.representativeContact,
          assigned_trainer_id: school.assignedTrainerId,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        village: data.village,
        taluka: data.taluka,
        district: data.district,
        pinCode: data.pin_code,
        programStartDate: data.program_start_date,
        representativeName: data.representative_name,
        representativeContact: data.representative_contact,
        assignedTrainerId: data.assigned_trainer_id,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase insert school error:', err);
      return null;
    }
  },

  // --- QUESTIONS (Dynamic ~90 questions per paper) ---
  async getQuestions(paperType?: PaperType): Promise<Question[] | null> {
    if (!supabase) return null;
    try {
      let query = supabase.from('questions').select('*').order('question_number', { ascending: true });
      if (paperType) {
        query = query.eq('paper_type', paperType);
      }
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        paperType: row.paper_type as PaperType,
        questionNumber: row.question_number,
        textMr: row.text_mr,
        textEn: row.text_en,
        options: row.options || [],
        correctOptionCode: row.correct_option,
        category: row.category,
        marks: Number(row.marks) || 1,
        scoringRubric: row.scoring_rubric || undefined,
      }));
    } catch (err) {
      console.warn('Supabase fetch questions error:', err);
      return null;
    }
  },

  // --- STUDENTS ---
  async getStudentsBySchool(schoolId: string): Promise<Student[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('bundle_sequence_no', { ascending: true });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        schoolId: row.school_id,
        bundleSequenceNo: row.bundle_sequence_no,
        fullName: row.full_name,
        gender: row.gender,
        standard: row.standard,
        division: row.division,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetch students error:', err);
      return null;
    }
  },

  // --- SESSION LOGS ---
  async getSessionLogs(schoolId?: string): Promise<SessionLog[] | null> {
    if (!supabase) return null;
    try {
      let query = supabase.from('session_logs').select('*').order('session_date', { ascending: false });
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        schoolId: row.school_id,
        sessionNumber: row.session_number,
        conductedDate: row.session_date || row.conducted_date || new Date().toISOString().split('T')[0],
        durationMinutes: row.duration_minutes || 45,
        totalAttendance: row.present_students_count || ((row.girls_present || 0) + (row.boys_present || 0)),
        girlsPresent: row.girls_present || 0,
        boysPresent: row.boys_present || 0,
        toolsUsed: row.tools_used || 'फलक, पेन',
        specialNotes: row.summary_notes || row.special_notes || '',
        conductedBy: row.conducted_by,
        media: [],
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetch session logs error:', err);
      return null;
    }
  },
};
