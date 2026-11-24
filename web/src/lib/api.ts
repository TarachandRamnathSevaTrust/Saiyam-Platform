import { supabase, isSupabaseConfigured, createIsolatedAuthClient } from './supabase';
import {
  School,
  Student,
  Question,
  PaperType,
  SessionLog,
  Organization,
  UserProfile,
  CurriculumModule,
  CurriculumSession,
  SchoolDocument,
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
  async getCurrentSessionUser(): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const cleanEmail = (session.user.email || '').trim().toLowerCase();
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${session.user.id},auth_user_id.eq.${session.user.id},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (profileRow) {
        return {
          id: profileRow.id,
          authUserId: profileRow.auth_user_id || profileRow.id,
          fullName: profileRow.full_name || profileRow.email,
          email: profileRow.email,
          role: (profileRow.role as any) || undefined,
          phone: profileRow.phone || undefined,
          organizationId: profileRow.organization_id || undefined,
          organizationCode: profileRow.organization_code || undefined,
          isActive: profileRow.is_active ?? true,
          createdAt: profileRow.created_at,
        };
      }

      return {
        id: session.user.id,
        authUserId: session.user.id,
        fullName:
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          'User',
        email: session.user.email || '',
        role: (session.user.user_metadata?.role as any) || undefined,
        isActive: true,
        createdAt: session.user.created_at,
      };
    } catch (e) {
      return null;
    }
  },

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
      const cleanEmail = (data.user.email || email).trim().toLowerCase();
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${data.user.id},auth_user_id.eq.${data.user.id},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (profileRow) {
        return {
          user: {
            id: profileRow.id,
            authUserId: profileRow.auth_user_id || profileRow.id,
            fullName: profileRow.full_name || profileRow.email,
            email: profileRow.email,
            role: (profileRow.role as any) || undefined,
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
          role: (data.user.user_metadata?.role as any) || undefined,
          isActive: true,
          createdAt: data.user.created_at,
        },
        error: null,
      };
    } catch (err: any) {
      return { user: null, error: err.message || 'Authentication error' };
    }
  },

  async createTrainerUser(data: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    organizationId?: string;
    organizationCode?: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!supabase) return { user: null, error: 'Supabase client not initialized' };
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPassword = data.password?.trim() || '';

      if (!cleanPassword || cleanPassword.length < 6) {
        return {
          user: null,
          error: 'Password must be at least 6 characters long for Supabase Auth.',
        };
      }

      // Use isolated auth client without session persistence so the active
      // admin session in localStorage is not hijacked or replaced.
      const authClient = createIsolatedAuthClient() || supabase;

      // 1. Directly create/register user in Supabase Auth (auth.users) with the entered password
      let authUserId: string | null = null;
      let alreadyRegistered = false;

      const { data: authData, error: authError } = await authClient.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: data.fullName.trim(),
            role: 'FIELD_TRAINER',
            organization_id: data.organizationId || null,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          alreadyRegistered = true;
        } else {
          // Return the real Supabase Auth error (e.g., rate limit, weak password, invalid email)
          return { user: null, error: `Supabase Auth error: ${authError.message}` };
        }
      }

      if (authData?.user?.id) {
        authUserId = authData.user.id;
      }

      // If user was already registered in auth, look up their ID from profiles
      if (!authUserId) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          authUserId = existingProfile.id;
        } else {
          return {
            user: null,
            error: 'User already exists in Supabase Auth, but matching profile was not found. Please log in or manage via Supabase dashboard.',
          };
        }
      }

      // 2. Ensure public.profiles has organization, phone, and metadata linked to that real Supabase Auth user ID
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: authUserId,
            auth_user_id: authUserId,
            email: cleanEmail,
            full_name: data.fullName.trim(),
            phone: data.phone?.trim() || null,
            organization_id: data.organizationId || null,
            organization_code: data.organizationCode || null,
            role: 'FIELD_TRAINER',
            is_active: true,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (profileError) {
        console.warn('Profile upsert note:', profileError);
      }

      const finalUser: UserProfile = {
        id: profileRow?.id || authUserId,
        authUserId: profileRow?.auth_user_id || authUserId,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim(),
        organizationId: data.organizationId,
        organizationCode: data.organizationCode,
        role: 'FIELD_TRAINER',
        isActive: true,
        createdAt: profileRow?.created_at || new Date().toISOString(),
      };

      return {
        user: finalUser,
        error: alreadyRegistered
          ? 'User already exists in Supabase Auth. Profile linked to organization.'
          : null,
      };
    } catch (err: any) {
      console.warn('createTrainerUser error:', err);
      return { user: null, error: err.message || 'Failed to create trainer user in Supabase Auth' };
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
        role: (row.role as any) || undefined,
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

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .or(`id.eq.${id},auth_user_id.eq.${id}`);
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

  async updateSchool(schoolId: string, updates: Partial<School>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.village !== undefined) payload.village = updates.village;
      if (updates.taluka !== undefined) payload.taluka = updates.taluka;
      if (updates.district !== undefined) payload.district = updates.district;
      if (updates.pinCode !== undefined) payload.pin_code = updates.pinCode;
      if (updates.programStartDate !== undefined) payload.program_start_date = updates.programStartDate;
      if (updates.representativeName !== undefined) payload.representative_name = updates.representativeName;
      if (updates.representativeContact !== undefined) payload.representative_contact = updates.representativeContact;
      if (updates.assignedTrainerId !== undefined) payload.assigned_trainer_id = updates.assignedTrainerId || null;
      if (updates.organizationCode !== undefined) payload.organization_code = updates.organizationCode;

      const { error } = await supabase
        .from('schools')
        .update(payload)
        .eq('id', schoolId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase update school error:', err);
      return false;
    }
  },

  async deleteSchool(schoolId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase delete school error:', err);
      return false;
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
  async getAllStudents(): Promise<Student[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
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
      console.warn('Supabase fetch all students error:', err);
      return null;
    }
  },

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
      let query = supabase
        .from('session_logs')
        .select('*, session_media(*)')
        .order('conducted_date', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        schoolId: row.school_id,
        financialYear: row.financial_year || '2025-26',
        sessionNumber: row.session_number,
        conductedDate: row.conducted_date || new Date().toISOString().split('T')[0],
        durationMinutes: row.duration_minutes || 45,
        totalAttendance: row.total_attendance || ((row.girls_present || 0) + (row.boys_present || 0)),
        girlsPresent: row.girls_present || 0,
        boysPresent: row.boys_present || 0,
        toolsUsed: row.tools_used || 'फलक, पेन',
        specialNotes: row.special_notes || '',
        conductedBy: row.conducted_by,
        media: (row.session_media || [])
          .filter((m: any) => Boolean(m.file_url && !m.file_url.includes('example.com')))
          .map((m: any) => ({
            id: m.id,
            sessionLogId: m.session_log_id,
            mediaType: m.media_type,
            fileUrl: m.file_url,
            fileName: m.file_name,
            fileSizeBytes: m.file_size_bytes,
            uploadedAt: m.uploaded_at,
          })),
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
      const isValidUuid = (val?: string) =>
        Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

      // Use upsert on unique constraint (school_id, financial_year, session_number)
      // to seamlessly support both insert and update without 409 unique constraint errors
      const { data, error } = await supabase
        .from('session_logs')
        .upsert(
          {
            school_id: log.schoolId,
            financial_year: log.financialYear || '2025-26',
            session_number: log.sessionNumber,
            conducted_date: log.conductedDate,
            duration_minutes: log.durationMinutes,
            total_attendance: log.totalAttendance,
            girls_present: log.girlsPresent,
            boys_present: log.boysPresent,
            tools_used: log.toolsUsed,
            special_notes: log.specialNotes,
            conducted_by: isValidUuid(log.conductedBy) ? log.conductedBy : null,
          },
          { onConflict: 'school_id,financial_year,session_number' }
        )
        .select()
        .single();

      if (error) throw error;

      // Sync photos to session_media table if provided
      let savedMedia = log.media || [];
      if (log.media && log.media.length > 0) {
        try {
          await supabase.from('session_media').delete().eq('session_log_id', data.id);
          const mediaRows = log.media.map((m, idx) => ({
            session_log_id: data.id,
            media_type: m.mediaType || 'PHOTO',
            file_url: m.fileUrl,
            file_name: m.fileName || `session_${log.sessionNumber}_photo_${idx + 1}.jpg`,
            uploaded_at: m.uploadedAt || new Date().toISOString(),
          }));
          const { data: insertedMedia } = await supabase.from('session_media').insert(mediaRows).select();
          if (insertedMedia) {
            savedMedia = insertedMedia.map((m: any) => ({
              id: m.id,
              sessionLogId: m.session_log_id,
              mediaType: m.media_type,
              fileUrl: m.file_url,
              fileName: m.file_name,
              fileSizeBytes: m.file_size_bytes,
              uploadedAt: m.uploaded_at,
            }));
          }
        } catch (mediaErr) {
          console.warn('Failed to sync session media proofs:', mediaErr);
        }
      }

      return {
        id: data.id,
        schoolId: data.school_id,
        financialYear: data.financial_year || '2025-26',
        sessionNumber: data.session_number,
        conductedDate: data.conducted_date,
        durationMinutes: data.duration_minutes,
        totalAttendance: data.total_attendance,
        girlsPresent: data.girls_present,
        boysPresent: data.boys_present,
        toolsUsed: data.tools_used,
        specialNotes: data.special_notes,
        conductedBy: data.conducted_by,
        media: savedMedia,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase create/upsert session log error:', err);
      return null;
    }
  },

  // ============================================================================
  // ASSESSMENTS & RESPONSES (चाचण्या व उत्तरे)
  // ============================================================================
  async saveAssessment(
    studentId: string,
    paperType: PaperType,
    phase: 'PRE' | 'POST',
    scoreData: {
      totalQuestions: number;
      answeredCount: number;
      correctCount: number;
      scorePercentage: number;
      recordedBy?: string;
    },
    responses: { questionId: string; selectedOptionCode?: string; isCorrect?: boolean; pointsAwarded?: number }[]
  ): Promise<string | null> {
    if (!supabase) return null;
    try {
      const isValidUuid = (val?: string) =>
        Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

      if (!isValidUuid(studentId)) {
        console.warn('Cannot save assessment: studentId is not a valid UUID:', studentId);
        return null;
      }

      // Check if assessment record already exists for this student, paperType, and phase
      const { data: existing } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .eq('paper_type', paperType)
        .eq('phase', phase)
        .maybeSingle();

      let assessmentId: string;

      if (existing?.id) {
        assessmentId = existing.id;
        await supabase
          .from('assessments')
          .update({
            total_questions: scoreData.totalQuestions,
            answered_count: scoreData.answeredCount,
            correct_count: scoreData.correctCount,
            score_percentage: scoreData.scorePercentage,
            completed_at: new Date().toISOString(),
            recorded_by: isValidUuid(scoreData.recordedBy) ? scoreData.recordedBy : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assessmentId);

        // Delete existing responses to replace with updated ones
        await supabase.from('assessment_responses').delete().eq('assessment_id', assessmentId);
      } else {
        const { data: created, error } = await supabase
          .from('assessments')
          .insert({
            student_id: studentId,
            paper_type: paperType,
            phase: phase,
            total_questions: scoreData.totalQuestions,
            answered_count: scoreData.answeredCount,
            correct_count: scoreData.correctCount,
            score_percentage: scoreData.scorePercentage,
            completed_at: new Date().toISOString(),
            recorded_by: isValidUuid(scoreData.recordedBy) ? scoreData.recordedBy : null,
          })
          .select('id')
          .single();

        if (error) throw error;
        assessmentId = created.id;
      }

      // Insert responses if valid question UUIDs
      const validResponses = responses.filter((r) => isValidUuid(r.questionId));
      if (validResponses.length > 0) {
        await supabase.from('assessment_responses').insert(
          validResponses.map((r) => ({
            assessment_id: assessmentId,
            question_id: r.questionId,
            selected_option: r.selectedOptionCode || null,
            is_correct: r.isCorrect ?? null,
            points_awarded: r.pointsAwarded ?? 0,
          }))
        );
      }

      return assessmentId;
    } catch (err) {
      console.warn('Supabase save assessment error:', err);
      return null;
    }
  },

  async getAllAssessmentsWithResponses(): Promise<
    Array<{
      id: string;
      studentId: string;
      paperType: PaperType;
      phase: 'PRE' | 'POST';
      totalQuestions: number;
      answeredCount: number;
      correctCount: number;
      scorePercentage: number;
      completedAt: string;
      recordedBy?: string;
      responses: Array<{
        questionId: string;
        selectedOptionCode?: string;
        isCorrect?: boolean;
        pointsAwarded?: number;
      }>;
    }> | null
  > {
    if (!supabase) return null;
    try {
      const { data: assessmentRows, error } = await supabase
        .from('assessments')
        .select('*');

      if (error) throw error;
      if (!assessmentRows || assessmentRows.length === 0) return [];

      const assessmentIds = assessmentRows.map((a) => a.id);

      // Fetch all responses for these assessments
      const { data: responseRows, error: respError } = await supabase
        .from('assessment_responses')
        .select('*')
        .in('assessment_id', assessmentIds);

      if (respError) {
        console.warn('Error fetching assessment responses:', respError);
      }

      const responseMap = new Map<string, any[]>();
      (responseRows || []).forEach((r) => {
        const list = responseMap.get(r.assessment_id) || [];
        list.push({
          questionId: r.question_id,
          selectedOptionCode: r.selected_option || undefined,
          isCorrect: r.is_correct ?? undefined,
          pointsAwarded: r.points_awarded ? Number(r.points_awarded) : undefined,
        });
        responseMap.set(r.assessment_id, list);
      });

      return assessmentRows.map((row) => ({
        id: row.id,
        studentId: row.student_id,
        paperType: row.paper_type as PaperType,
        phase: row.phase as 'PRE' | 'POST',
        totalQuestions: row.total_questions,
        answeredCount: row.answered_count,
        correctCount: row.correct_count,
        scorePercentage: Number(row.score_percentage),
        completedAt: row.completed_at || row.created_at,
        recordedBy: row.recorded_by || undefined,
        responses: responseMap.get(row.id) || [],
      }));
    } catch (err) {
      console.warn('Supabase fetch assessments error:', err);
      return null;
    }
  },

  async getStudentAssessmentResponses(
    studentId: string,
    paperType: PaperType,
    phase: 'PRE' | 'POST'
  ): Promise<Record<string, string> | null> {
    if (!supabase) return null;
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .eq('paper_type', paperType)
        .eq('phase', phase)
        .maybeSingle();

      if (error || !assessment) return null;

      const { data: responses, error: respError } = await supabase
        .from('assessment_responses')
        .select('question_id, selected_option')
        .eq('assessment_id', assessment.id);

      if (respError || !responses) return null;

      const map: Record<string, string> = {};
      responses.forEach((r) => {
        if (r.selected_option) {
          map[r.question_id] = r.selected_option;
        }
      });
      return map;
    } catch (err) {
      console.warn('Supabase fetch student responses error:', err);
      return null;
    }
  },

  // ============================================================================
  // CURRICULUM MODULES & SESSIONS (अभ्यासक्रम विभाग व २५ सत्रे)
  // ============================================================================
  async getCurriculumModules(): Promise<CurriculumModule[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('curriculum_modules')
        .select('*')
        .order('module_number', { ascending: true });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        moduleNumber: row.module_number,
        nameMr: row.name_mr,
        nameEn: row.name_en,
        descriptionMr: row.description_mr,
        descriptionEn: row.description_en,
      }));
    } catch (err) {
      console.warn('Supabase fetch curriculum modules error (falling back to shared master):', err);
      return null;
    }
  },

  async getCurriculumSessions(): Promise<CurriculumSession[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('curriculum_sessions')
        .select('*')
        .order('session_number', { ascending: true });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        sessionNumber: row.session_number,
        phaseNumber: row.phase_number,
        titleMr: row.title_mr || row.session_name_mr || `सत्र ${row.session_number}`,
        titleEn: row.title_en || row.session_name_en || `Session ${row.session_number}`,
        sessionNameMr: row.session_name_mr || row.title_mr,
        sessionNameEn: row.session_name_en || row.title_en,
        moduleNumber: row.module_number,
        moduleNameMr: row.module_name_mr,
        moduleNameEn: row.module_name_en,
        description: row.description || row.description_mr || row.description_en,
        descriptionMr: row.description_mr,
        descriptionEn: row.description_en,
      }));
    } catch (err) {
      console.warn('Supabase fetch curriculum sessions error (falling back to shared master):', err);
      return null;
    }
  },

  // ============================================================================
  // SCHOOL DOCUMENTS (शाळा कागदपत्रे - मुख्याध्यापक विनंती पत्र, सही व शिक्का)
  // ============================================================================
  async getSchoolDocuments(schoolId: string): Promise<SchoolDocument[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('school_documents')
        .select('*')
        .eq('school_id', schoolId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch school_documents error:', error);
        return null;
      }

      return (data || []).map((d: any) => ({
        id: d.id,
        schoolId: d.school_id,
        financialYear: d.financial_year,
        documentType: d.document_type,
        title: d.title,
        fileUrl: d.file_url,
        fileSizeBytes: d.file_size_bytes,
        uploadedBy: d.uploaded_by,
        uploadedAt: d.uploaded_at,
      }));
    } catch (err) {
      console.warn('Supabase getSchoolDocuments error:', err);
      return null;
    }
  },

  async saveSchoolDocument(doc: {
    schoolId: string;
    financialYear?: string;
    documentType: 'REQUEST_LETTER' | 'STAMPED_COMPLETION_SHEET' | 'OTHER';
    title: string;
    fileUrl: string;
    fileSizeBytes?: number;
    uploadedBy?: string;
  }): Promise<SchoolDocument | null> {
    if (!supabase) return null;
    try {
      // First delete existing doc of same type for this school
      await supabase
        .from('school_documents')
        .delete()
        .eq('school_id', doc.schoolId)
        .eq('document_type', doc.documentType);

      const { data, error } = await supabase
        .from('school_documents')
        .insert({
          school_id: doc.schoolId,
          financial_year: doc.financialYear || '2025-26',
          document_type: doc.documentType,
          title: doc.title,
          file_url: doc.fileUrl,
          file_size_bytes: doc.fileSizeBytes || null,
          uploaded_by: doc.uploadedBy || null,
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase saveSchoolDocument error:', error);
        return null;
      }

      return {
        id: data.id,
        schoolId: data.school_id,
        financialYear: data.financial_year,
        documentType: data.document_type,
        title: data.title,
        fileUrl: data.file_url,
        fileSizeBytes: data.file_size_bytes,
        uploadedBy: data.uploaded_by,
        uploadedAt: data.uploaded_at,
      };
    } catch (err) {
      console.warn('Supabase saveSchoolDocument exception:', err);
      return null;
    }
  },

  async deleteSchoolDocument(schoolId: string, documentType: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('school_documents')
        .delete()
        .eq('school_id', schoolId)
        .eq('document_type', documentType);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteSchoolDocument exception:', err);
      return false;
    }
  },
};
