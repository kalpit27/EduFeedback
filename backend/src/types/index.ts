import { Request } from 'express';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  departmentId?: string;
  studentId?: string;
  employeeId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export type FormType =
  | 'STUDENT_TO_TEACHER'
  | 'TEACHER_TO_STUDENT'
  | 'PARENT_TO_INSTITUTE'
  | 'GENERAL'
  | 'COMPLAINT';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

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
