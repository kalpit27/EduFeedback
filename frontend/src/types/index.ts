export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  department?: Department | string;
  employeeId?: string;
  studentId?: string;
  linkedStudents?: User[];
  profile?: any;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  department: Department | string;
  durationYears: number;
  totalSemesters: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicClass {
  _id: string;
  name: string;
  division: string;
  course: Course | string;
  department: Department | string;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Semester {
  _id: string;
  name: string;
  semesterNumber: number;
  course: Course | string;
  academicClass: AcademicClass | string;
  department: Department | string;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: Department | string;
  course: Course | string;
  academicClass: AcademicClass | string;
  semester: Semester | string;
  credits: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TeacherAssignment {
  _id: string;
  teacher: User;
  department: Department;
  course: Course;
  academicClass: AcademicClass;
  semester: Semester;
  subject: Subject;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StudentProfile {
  _id: string;
  user: User;
  studentId: string;
  rollNumber?: string;
  department: Department;
  course: Course;
  academicClass: AcademicClass;
  semester: Semester;
  academicYear: string;
  parents: User[];
  status: 'ACTIVE' | 'INACTIVE';
}

export type QuestionType =
  | 'STAR_RATING'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOX'
  | 'DROPDOWN'
  | 'YES_NO'
  | 'TEXT'
  | 'LONG_TEXT'
  | 'RATING_SCALE'
  | 'NUMBER_RATING';

export interface FormQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  category: string;
  order: number;
  min?: number;
  max?: number;
}

export interface FeedbackForm {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  formType: 'STUDENT_TO_TEACHER' | 'TEACHER_TO_STUDENT' | 'PARENT_TO_INSTITUTE' | 'GENERAL' | 'COMPLAINT';
  department: Department | string;
  course?: Course | string;
  academicClass?: AcademicClass | string;
  semester?: Semester | string;
  subject?: Subject | string;
  teacher?: User | string;
  startDate?: string;
  endDate?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  questions: FormQuestion[];
  createdBy: User | string;
  createdAt: string;
  isSubmitted?: boolean;
  submittedAt?: string | null;
}

export interface FeedbackAnswer {
  questionId: string;
  questionText: string;
  category: string;
  type: string;
  value: any;
  numericValue?: number;
}

export interface FeedbackResponse {
  _id: string;
  form: FeedbackForm;
  student: User;
  teacher?: User;
  department: Department;
  course?: Course;
  academicClass?: AcademicClass;
  semester?: Semester;
  subject?: Subject;
  answers: FeedbackAnswer[];
  submittedAt: string;
}

export interface AttendanceRecord {
  student: User | string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
}

export interface AttendanceSession {
  _id: string;
  date: string;
  subject: Subject;
  teacher: User;
  academicClass: AcademicClass;
  semester: Semester;
  records: AttendanceRecord[];
}

export interface TeacherFeedbackEvaluation {
  _id: string;
  teacher: User;
  student: User;
  subject: Subject;
  semester?: Semester;
  academicPerformance: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  participation: number;
  attendancePercentage?: number;
  strengths: string;
  areasOfImprovement: string;
  remarks?: string;
  concerns?: string;
  date: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: 'ACADEMIC' | 'INFRASTRUCTURE' | 'ADMINISTRATIVE' | 'FACULTY' | 'HARASSMENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: User;
  department?: Department;
  relatedStudent?: User;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  resolvedAt?: string;
  resolvedBy?: User;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  instituteName: string;
  instituteCode: string;
  academicYear: string;
  contactEmail: string;
  contactPhone: string;
  allowLateSubmissions: boolean;
  enableEmailNotifications: boolean;
  themePrimaryColor: string;
}
