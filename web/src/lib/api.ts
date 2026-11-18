import { supabase, isSupabaseConfigured } from './supabase';
import {
  School,
  Student,
  Question,
  PaperType,
  SessionLog,
  Organization,
  UserProfile,
} from '@saiyam/shared';

/**
 * Saiyam Data Service Layer:
 * Automatically uses Supabase PostgreSQL when credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * are configured. Gracefully handles errors and offline fallbacks.
 */

export const apiService = {
  // Check if live Supabase backend is configured
  isConnected(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  // ============================================================================
  // SUPABASE AUTH (ईमेल व पासवर्ड थेट लॉगिन)
  // ============================================================================
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!supabase) return { user: null, error: 'Supabase client not initialized' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'User not returned from Supabase Auth.' };
      }

      // Fetch matching profile from public.profiles
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileRow) {
        return {
          user: {
            id: profileRow.id,
            authUserId: profileRow.auth_user_id || profileRow.id,
            fullName: profileRow.full_name || profileRow.email,
            email: profileRow.email,
            role: profileRow.role || 'FIELD_TRAINER',
            phone: profileRow.phone || undefined,
            organizationId: profileRow.organization_id || undefined,
            organizationCode: profileRow.organization_code || undefined,
            isActive: profileRow.is_active ?? true,
            createdAt: profileRow.created_at,
          },
          error: null,
        };
      }

      // Fallback if profile row is slightly delayed
      return {
        user: {
          id: data.user.id,
          authUserId: data.user.id,
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || email,
          role: (data.user.user_metadata?.role as any) || 'FIELD_TRAINER',
          isActive: true,
          createdAt: data.user.created_at,
        },
        error: null,
      };
    } catch (err: any) {
      return { user: null, error: err.message || 'Authentication error' };
    }
  },

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  // ============================================================================
  // PROFILES / BACKEND USERS (प्रशासक, समन्वयक, प्रशिक्षक प्रोफाइल)
  // ============================================================================
  async getProfiles(): Promise<UserProfile[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        authUserId: row.auth_user_id || row.id,
        fullName: row.full_name || row.email,
        email: row.email,
        role: row.role || 'FIELD_TRAINER',
        phone: row.phone || undefined,
        organizationId: row.organization_id || undefined,
        organizationCode: row.organization_code || undefined,
        isActive: row.is_active ?? true,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.warn('Supabase fetch profiles error:', err);
      return null;
    }
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: Record<string, any> = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.organizationCode !== undefined) payload.organization_code = updates.organizationCode;
      if (updates.organizationId !== undefined) payload.organization_id = updates.organizationId;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      const { error } = await supabase.from('profiles').update(payload).eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase update profile error:', err);
      return false;
    }
  },

  // ============================================================================
  // ORGANIZATIONS (संस्था व्यवस्थापन)
  // ============================================================================
  async getOrganizations(): Promise<Organization[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        code: row.code,
        nameMr: row.name_mr || row.name_en,
        nameEn: row.name_en || row.name_mr,
        orgType: row.org_type || 'PARTNER_NGO',
        description: row.description || '',
        contactPerson: row.contact_person || '',
        contactPhone: row.contact_phone || '',
        contactEmail: row.contact_email || '',
        coordinatorUserId: row.coordinator_user_id || undefined,
        coordinatorUserName: row.coordinator_name || undefined,
        coordinatorEmail: row.coordinator_email || undefined,
        isActive: row.is_active ?? true,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.warn('Supabase fetch organizations error:', err);
      return null;
    }
  },

  async createOrganization(
    org: Omit<Organization, 'id' | 'createdAt' | 'isActive'>
  ): Promise<Organization | null> {
    if (!supabase) return null;
    try {
      // 1. Try inserting with coordinator columns
      const fullPayload: Record<string, any> = {
        code: org.code,
        name_mr: org.nameMr,
        name_en: org.nameEn || org.nameMr,
        org_type: org.orgType || 'PARTNER_NGO',
        description: org.description || '',
        contact_person: org.contactPerson || '',
        contact_phone: org.contactPhone || '',
        contact_email: org.contactEmail || '',
        is_active: true,
      };

      if (org.coordinatorUserId) fullPayload.coordinator_user_id = org.coordinatorUserId;
      if (org.coordinatorUserName) fullPayload.coordinator_name = org.coordinatorUserName;
      if (org.coordinatorEmail) fullPayload.coordinator_email = org.coordinatorEmail;

      let { data, error } = await supabase
        .from('organizations')
        .insert(fullPayload)
        .select()
        .single();

      // Fallback: If coordinator columns don't exist yet in Supabase table before SQL patch is run
      if (error && error.message?.includes('column')) {
        const standardPayload = {
          code: org.code,
          name_mr: org.nameMr,
          name_en: org.nameEn || org.nameMr,
          org_type: org.orgType || 'PARTNER_NGO',
          description: org.description || '',
          contact_person: org.contactPerson || '',
          contact_phone: org.contactPhone || '',
          contact_email: org.contactEmail || '',
          is_active: true,
        };
        const retryResult = await supabase
          .from('organizations')
          .insert(standardPayload)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        code: data.code,
        nameMr: data.name_mr,
        nameEn: data.name_en,
        orgType: data.org_type,
        description: data.description,
        contactPerson: data.contact_person,
        contactPhone: data.contact_phone,
        contactEmail: data.contact_email,
        coordinatorUserId: data.coordinator_user_id || org.coordinatorUserId,
        coordinatorUserName: data.coordinator_name || org.coordinatorUserName,
        coordinatorEmail: data.coordinator_email || org.coordinatorEmail,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase create organization error:', err);
      return null;
    }
  },

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: Record<string, any> = {};
      if (updates.nameMr !== undefined) payload.name_mr = updates.nameMr;
      if (updates.nameEn !== undefined) payload.name_en = updates.nameEn;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.orgType !== undefined) payload.org_type = updates.orgType;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
      if (updates.contactPhone !== undefined) payload.contact_phone = updates.contactPhone;
      if (updates.contactEmail !== undefined) payload.contact_email = updates.contactEmail;
      if (updates.coordinatorUserId !== undefined) payload.coordinator_user_id = updates.coordinatorUserId;
      if (updates.coordinatorUserName !== undefined) payload.coordinator_name = updates.coordinatorUserName;
      if (updates.coordinatorEmail !== undefined) payload.coordinator_email = updates.coordinatorEmail;

      const { error } = await supabase.from('organizations').update(payload).eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase update organization error:', err);
      return false;
    }
  },

  async deleteOrganization(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase delete organization error:', err);
      return false;
    }
  },

  // ============================================================================
  // SCHOOLS (शाळा व्यवस्थापन)
  // ============================================================================
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
        financialYear: row.financial_year || '2025-26',
        organizationCode: row.organization_code || 'TRST_DIRECT',
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
          financial_year: school.financialYear || '2025-26',
          organization_code: school.organizationCode || 'TRST_DIRECT',
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
        financialYear: data.financial_year || school.financialYear || '2025-26',
        organizationCode: data.organization_code || school.organizationCode || 'TRST_DIRECT',
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

  // ============================================================================
  // QUESTIONS (Dynamic ~90 questions per paper)
  // ============================================================================
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

  // ============================================================================
  // STUDENTS (विद्यार्थी यादी)
  // ============================================================================
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
        financialYear: row.financial_year || '2025-26',
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

  async createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          school_id: student.schoolId,
          financial_year: student.financialYear || '2025-26',
          bundle_sequence_no: student.bundleSequenceNo,
          full_name: student.fullName,
          gender: student.gender,
          standard: student.standard,
          division: student.division,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        schoolId: data.school_id,
        financialYear: data.financial_year || '2025-26',
        bundleSequenceNo: data.bundle_sequence_no,
        fullName: data.full_name,
        gender: data.gender,
        standard: data.standard,
        division: data.division,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase create student error:', err);
      return null;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: Record<string, any> = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.gender !== undefined) payload.gender = updates.gender;
      if (updates.standard !== undefined) payload.standard = updates.standard;
      if (updates.division !== undefined) payload.division = updates.division;
      if (updates.bundleSequenceNo !== undefined) payload.bundle_sequence_no = updates.bundleSequenceNo;

      const { error } = await supabase.from('students').update(payload).eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase update student error:', err);
      return false;
    }
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase delete student error:', err);
      return false;
    }
  },

  // ============================================================================
  // SESSION LOGS (सत्र नोंदी)
  // ============================================================================
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
        financialYear: row.financial_year || '2025-26',
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

  async createSessionLog(log: Omit<SessionLog, 'id' | 'createdAt'>): Promise<SessionLog | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('session_logs')
        .insert({
          school_id: log.schoolId,
          financial_year: log.financialYear || '2025-26',
          session_number: log.sessionNumber,
          session_date: log.conductedDate,
          duration_minutes: log.durationMinutes,
          present_students_count: log.totalAttendance,
          girls_present: log.girlsPresent,
          boys_present: log.boysPresent,
          tools_used: log.toolsUsed,
          summary_notes: log.specialNotes,
          conducted_by: log.conductedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        schoolId: data.school_id,
        financialYear: data.financial_year || '2025-26',
        sessionNumber: data.session_number,
        conductedDate: data.session_date,
        durationMinutes: data.duration_minutes,
        totalAttendance: data.present_students_count,
        girlsPresent: data.girls_present,
        boysPresent: data.boys_present,
        toolsUsed: data.tools_used,
        specialNotes: data.summary_notes,
        conductedBy: data.conducted_by,
        media: [],
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase create session log error:', err);
      return null;
    }
  },
};
