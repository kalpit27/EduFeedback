import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { AcademicClass } from '../models/AcademicClass.js';
import { Semester } from '../models/Semester.js';
import { Subject } from '../models/Subject.js';
import { TeacherAssignment } from '../models/TeacherAssignment.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { FeedbackForm } from '../models/FeedbackForm.js';
import { FeedbackResponse } from '../models/FeedbackResponse.js';
import { Attendance } from '../models/Attendance.js';
import { TeacherFeedback } from '../models/TeacherFeedback.js';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { SystemSettings } from '../models/SystemSettings.js';

dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/institute_feedback';
  console.log(`[Seed] Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    AcademicClass.deleteMany({}),
    Semester.deleteMany({}),
    Subject.deleteMany({}),
    TeacherAssignment.deleteMany({}),
    StudentProfile.deleteMany({}),
    FeedbackForm.deleteMany({}),
    FeedbackResponse.deleteMany({}),
    Attendance.deleteMany({}),
    TeacherFeedback.deleteMany({}),
    Complaint.deleteMany({}),
    Notification.deleteMany({}),
    SystemSettings.deleteMany({}),
  ]);

  console.log('[Seed] Seeding System Settings...');
  await SystemSettings.create({
    instituteName: 'Apex Institute of Technology & Management',
    instituteCode: 'AITM',
    academicYear: '2025-2026',
    contactEmail: 'administration@aitm.edu',
    contactPhone: '+1 (555) 019-2834',
    allowLateSubmissions: false,
    enableEmailNotifications: true,
    themePrimaryColor: '#1DCED8',
  });

  console.log('[Seed] Seeding Departments...');
  const [deptMCA, deptCom, deptMgmt] = await Department.create([
    {
      name: 'Department of Computer Applications',
      code: 'MCA_DEPT',
      description: 'School of Advanced Computing, Software Engineering, and AI Studies',
      status: 'ACTIVE',
    },
    {
      name: 'Department of Commerce & Finance',
      code: 'COM_DEPT',
      description: 'School of Business Economics, Taxation, and Corporate Accounting',
      status: 'ACTIVE',
    },
    {
      name: 'Department of Management Studies',
      code: 'MGMT_DEPT',
      description: 'School of Executive Leadership, Marketing, and Operations Management',
      status: 'ACTIVE',
    },
  ]);

  console.log('[Seed] Seeding Courses...');
  const courseMCA = await Course.create({
    name: 'Master of Computer Applications (MCA)',
    code: 'MCA',
    department: deptMCA._id,
    durationYears: 2,
    totalSemesters: 4,
    status: 'ACTIVE',
  });

  const courseBCom = await Course.create({
    name: 'Bachelor of Commerce (B.Com)',
    code: 'BCOM',
    department: deptCom._id,
    durationYears: 3,
    totalSemesters: 6,
    status: 'ACTIVE',
  });

  const courseBBA = await Course.create({
    name: 'Bachelor of Business Administration (BBA)',
    code: 'BBA',
    department: deptMgmt._id,
    durationYears: 3,
    totalSemesters: 6,
    status: 'ACTIVE',
  });

  console.log('[Seed] Seeding Academic Classes...');
  const mcaFY = await AcademicClass.create({
    name: 'FY',
    division: 'A',
    course: courseMCA._id,
    department: deptMCA._id,
    academicYear: '2025-2026',
  });

  const mcaSY = await AcademicClass.create({
    name: 'SY',
    division: 'A',
    course: courseMCA._id,
    department: deptMCA._id,
    academicYear: '2025-2026',
  });

  const bcomSY = await AcademicClass.create({
    name: 'SY',
    division: 'A',
    course: courseBCom._id,
    department: deptCom._id,
    academicYear: '2025-2026',
  });

  const bbaSY = await AcademicClass.create({
    name: 'SY',
    division: 'A',
    course: courseBBA._id,
    department: deptMgmt._id,
    academicYear: '2025-2026',
  });

  console.log('[Seed] Seeding Semesters...');
  const mcaSem1 = await Semester.create({
    name: 'Semester I',
    semesterNumber: 1,
    course: courseMCA._id,
    academicClass: mcaFY._id,
    department: deptMCA._id,
    academicYear: '2025-2026',
  });

  const mcaSem3 = await Semester.create({
    name: 'Semester III',
    semesterNumber: 3,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    department: deptMCA._id,
    academicYear: '2025-2026',
  });

  const bcomSem3 = await Semester.create({
    name: 'Semester III',
    semesterNumber: 3,
    course: courseBCom._id,
    academicClass: bcomSY._id,
    department: deptCom._id,
    academicYear: '2025-2026',
  });

  const bbaSem3 = await Semester.create({
    name: 'Semester III',
    semesterNumber: 3,
    course: courseBBA._id,
    academicClass: bbaSY._id,
    department: deptMgmt._id,
    academicYear: '2025-2026',
  });

  console.log('[Seed] Seeding Subjects...');
  const subjJava = await Subject.create({
    name: 'Advanced Java Programming & Enterprise Apps',
    code: 'MCA301',
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    credits: 4,
  });

  const subjCloud = await Subject.create({
    name: 'Cloud Computing Architecture & DevOps',
    code: 'MCA302',
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    credits: 4,
  });

  const subjFullstack = await Subject.create({
    name: 'Full-Stack Web Technologies',
    code: 'MCA303',
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    credits: 4,
  });

  const subjAccounting = await Subject.create({
    name: 'Corporate Accounting & Auditing',
    code: 'BC301',
    department: deptCom._id,
    course: courseBCom._id,
    academicClass: bcomSY._id,
    semester: bcomSem3._id,
    credits: 4,
  });

  const subjMarketing = await Subject.create({
    name: 'Strategic Marketing Management',
    code: 'BBA301',
    department: deptMgmt._id,
    course: courseBBA._id,
    academicClass: bbaSY._id,
    semester: bbaSem3._id,
    credits: 4,
  });

  console.log('[Seed] Seeding Users (Admin, Teachers, Parents, Students)...');
  // 1. Admin
  const adminUser = await User.create({
    name: 'Dr. Rajesh Deshmukh',
    email: 'admin@apexinstitute.edu',
    password: 'Admin@123',
    role: 'ADMIN',
    phone: '+1 (555) 100-0001',
    status: 'ACTIVE',
  });

  // 2. Teachers
  const teacherSharma = await User.create({
    name: 'Prof. Ramesh Sharma',
    email: 'prof.sharma@apexinstitute.edu',
    password: 'Teacher@123',
    role: 'TEACHER',
    department: deptMCA._id,
    employeeId: 'EMP-MCA-01',
    phone: '+1 (555) 200-0001',
    status: 'ACTIVE',
  });

  const teacherPatel = await User.create({
    name: 'Dr. Neha Patel',
    email: 'prof.patel@apexinstitute.edu',
    password: 'Teacher@123',
    role: 'TEACHER',
    department: deptMCA._id,
    employeeId: 'EMP-MCA-02',
    phone: '+1 (555) 200-0002',
    status: 'ACTIVE',
  });

  const teacherGupta = await User.create({
    name: 'Prof. Sanjay Gupta',
    email: 'prof.gupta@apexinstitute.edu',
    password: 'Teacher@123',
    role: 'TEACHER',
    department: deptCom._id,
    employeeId: 'EMP-COM-01',
    phone: '+1 (555) 200-0003',
    status: 'ACTIVE',
  });

  const teacherVerma = await User.create({
    name: 'Dr. Priya Verma',
    email: 'prof.verma@apexinstitute.edu',
    password: 'Teacher@123',
    role: 'TEACHER',
    department: deptMgmt._id,
    employeeId: 'EMP-MGT-01',
    phone: '+1 (555) 200-0004',
    status: 'ACTIVE',
  });

  // 3. Parents
  const parentVerma = await User.create({
    name: 'Vikramaditya Verma',
    email: 'parent.verma@parent.edu',
    password: 'Parent@123',
    role: 'PARENT',
    phone: '+1 (555) 300-0001',
    status: 'ACTIVE',
  });

  const parentSen = await User.create({
    name: 'Debashish Sen',
    email: 'parent.sen@parent.edu',
    password: 'Parent@123',
    role: 'PARENT',
    phone: '+1 (555) 300-0002',
    status: 'ACTIVE',
  });

  // 4. Students
  const studentRahul = await User.create({
    name: 'Rahul Verma',
    email: 'rahul.verma@student.edu',
    password: 'Student@123',
    role: 'STUDENT',
    department: deptMCA._id,
    studentId: 'MCA202401',
    phone: '+1 (555) 400-0001',
    status: 'ACTIVE',
  });

  const studentAnanya = await User.create({
    name: 'Ananya Sen',
    email: 'ananya.sen@student.edu',
    password: 'Student@123',
    role: 'STUDENT',
    department: deptMCA._id,
    studentId: 'MCA202402',
    phone: '+1 (555) 400-0002',
    status: 'ACTIVE',
  });

  const studentRohit = await User.create({
    name: 'Rohit Sharma',
    email: 'rohit.sharma@student.edu',
    password: 'Student@123',
    role: 'STUDENT',
    department: deptMCA._id,
    studentId: 'MCA202403',
    phone: '+1 (555) 400-0003',
    status: 'ACTIVE',
  });

  const studentPriya = await User.create({
    name: 'Priya Deshmukh',
    email: 'priya.deshmukh@student.edu',
    password: 'Student@123',
    role: 'STUDENT',
    department: deptCom._id,
    studentId: 'BCOM202401',
    phone: '+1 (555) 400-0004',
    status: 'ACTIVE',
  });

  const studentVikram = await User.create({
    name: 'Vikram Mehta',
    email: 'vikram.mehta@student.edu',
    password: 'Student@123',
    role: 'STUDENT',
    department: deptMgmt._id,
    studentId: 'BBA202401',
    phone: '+1 (555) 400-0005',
    status: 'ACTIVE',
  });

  // Link Parents to Students
  parentVerma.linkedStudents = [studentRahul._id as any];
  await parentVerma.save();

  parentSen.linkedStudents = [studentAnanya._id as any];
  await parentSen.save();

  console.log('[Seed] Seeding Student Profiles...');
  await StudentProfile.create([
    {
      user: studentRahul._id,
      studentId: 'MCA202401',
      rollNumber: '101',
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      academicYear: '2025-2026',
      parents: [parentVerma._id],
    },
    {
      user: studentAnanya._id,
      studentId: 'MCA202402',
      rollNumber: '102',
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      academicYear: '2025-2026',
      parents: [parentSen._id],
    },
    {
      user: studentRohit._id,
      studentId: 'MCA202403',
      rollNumber: '103',
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      academicYear: '2025-2026',
      parents: [],
    },
    {
      user: studentPriya._id,
      studentId: 'BCOM202401',
      rollNumber: '201',
      department: deptCom._id,
      course: courseBCom._id,
      academicClass: bcomSY._id,
      semester: bcomSem3._id,
      academicYear: '2025-2026',
      parents: [],
    },
    {
      user: studentVikram._id,
      studentId: 'BBA202401',
      rollNumber: '301',
      department: deptMgmt._id,
      course: courseBBA._id,
      academicClass: bbaSY._id,
      semester: bbaSem3._id,
      academicYear: '2025-2026',
      parents: [],
    },
  ]);

  console.log('[Seed] Seeding Teacher Assignments...');
  await TeacherAssignment.create([
    {
      teacher: teacherSharma._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      subject: subjJava._id,
      academicYear: '2025-2026',
    },
    {
      teacher: teacherSharma._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      subject: subjFullstack._id,
      academicYear: '2025-2026',
    },
    {
      teacher: teacherPatel._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      subject: subjCloud._id,
      academicYear: '2025-2026',
    },
    {
      teacher: teacherGupta._id,
      department: deptCom._id,
      course: courseBCom._id,
      academicClass: bcomSY._id,
      semester: bcomSem3._id,
      subject: subjAccounting._id,
      academicYear: '2025-2026',
    },
    {
      teacher: teacherVerma._id,
      department: deptMgmt._id,
      course: courseBBA._id,
      academicClass: bbaSY._id,
      semester: bbaSem3._id,
      subject: subjMarketing._id,
      academicYear: '2025-2026',
    },
  ]);

  console.log('[Seed] Seeding Dynamic Feedback Forms...');
  const formJava = await FeedbackForm.create({
    title: 'Mid-Semester Student Feedback: Advanced Java Programming',
    description: 'Confidential evaluation of pedagogy, subject clarity, and lab exercises for MCA Semester III.',
    instructions: 'Please provide honest feedback. Your responses are completely confidential and are only aggregated for academic quality enhancement.',
    formType: 'STUDENT_TO_TEACHER',
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    subject: subjJava._id,
    teacher: teacherSharma._id,
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-12-31'),
    status: 'PUBLISHED',
    createdBy: adminUser._id,
    questions: [
      {
        id: 'q1',
        text: 'How would you rate the instructor’s depth of subject knowledge & concept explanation?',
        type: 'STAR_RATING',
        category: 'Subject Knowledge',
        required: true,
        order: 1,
        min: 1,
        max: 5,
      },
      {
        id: 'q2',
        text: 'How effective is the instructor in communicating complex programming logic and solving doubts?',
        type: 'STAR_RATING',
        category: 'Communication',
        required: true,
        order: 2,
        min: 1,
        max: 5,
      },
      {
        id: 'q3',
        text: 'How would you evaluate the pace of lectures and adherence to course syllabus timetable?',
        type: 'RATING_SCALE',
        category: 'Teaching Quality',
        required: true,
        order: 3,
        min: 1,
        max: 5,
      },
      {
        id: 'q4',
        text: 'Does the instructor provide practical code examples and hands-on laboratory exercises?',
        type: 'YES_NO',
        category: 'Teaching Quality',
        options: ['Yes', 'No'],
        required: true,
        order: 4,
      },
      {
        id: 'q5',
        text: 'Which aspect of this course has been most beneficial to your learning so far?',
        type: 'MULTIPLE_CHOICE',
        category: 'Teaching Quality',
        options: ['Live Coding & Debugging', 'Architecture Diagrams', 'Assignment Feedback', 'Course Notes & Repositories'],
        required: true,
        order: 5,
      },
      {
        id: 'q6',
        text: 'Overall satisfaction rating with this course and instructor:',
        type: 'STAR_RATING',
        category: 'Overall Satisfaction',
        required: true,
        order: 6,
        min: 1,
        max: 5,
      },
      {
        id: 'q7',
        text: 'Constructive suggestions or additional comments for the faculty:',
        type: 'LONG_TEXT',
        category: 'General Feedback',
        required: false,
        order: 7,
      },
    ],
  });

  const formCloud = await FeedbackForm.create({
    title: 'Mid-Semester Student Feedback: Cloud Computing & DevOps',
    description: 'Evaluation of Cloud Computing hands-on labs and architectural concepts.',
    formType: 'STUDENT_TO_TEACHER',
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    subject: subjCloud._id,
    teacher: teacherPatel._id,
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-12-31'),
    status: 'PUBLISHED',
    createdBy: adminUser._id,
    questions: [
      {
        id: 'q1',
        text: 'Instructor explanation of Kubernetes, Docker, and AWS Architecture:',
        type: 'STAR_RATING',
        category: 'Subject Knowledge',
        required: true,
        order: 1,
      },
      {
        id: 'q2',
        text: 'Quality and accessibility of lab environments and cloud sandboxes:',
        type: 'STAR_RATING',
        category: 'Teaching Quality',
        required: true,
        order: 2,
      },
      {
        id: 'q3',
        text: 'Punctuality and regularity of lectures:',
        type: 'STAR_RATING',
        category: 'Punctuality',
        required: true,
        order: 3,
      },
    ],
  });

  const formParent = await FeedbackForm.create({
    title: 'Institutional Quality & Infrastructure Parent Survey 2025-26',
    description: 'Annual parent survey on campus infrastructure, safety, academic rigor, and communication.',
    formType: 'PARENT_TO_INSTITUTE',
    department: deptMCA._id,
    status: 'PUBLISHED',
    createdBy: adminUser._id,
    questions: [
      {
        id: 'pq1',
        text: 'Rate the institute’s communication regarding academic performance and attendance notices:',
        type: 'STAR_RATING',
        category: 'Communication',
        required: true,
        order: 1,
      },
      {
        id: 'pq2',
        text: 'Rate the quality of campus infrastructure, library, and lab facilities:',
        type: 'STAR_RATING',
        category: 'Infrastructure',
        required: true,
        order: 2,
      },
      {
        id: 'pq3',
        text: 'Overall satisfaction with student development and academic standards:',
        type: 'STAR_RATING',
        category: 'Overall Satisfaction',
        required: true,
        order: 3,
      },
    ],
  });

  console.log('[Seed] Seeding Feedback Responses...');
  // Response from Ananya Sen for Java form
  await FeedbackResponse.create({
    form: formJava._id,
    student: studentAnanya._id,
    teacher: teacherSharma._id,
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    subject: subjJava._id,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    answers: [
      { questionId: 'q1', questionText: 'Subject Knowledge', category: 'Subject Knowledge', type: 'STAR_RATING', value: 5, numericValue: 5 },
      { questionId: 'q2', questionText: 'Communication', category: 'Communication', type: 'STAR_RATING', value: 5, numericValue: 5 },
      { questionId: 'q3', questionText: 'Teaching Quality', category: 'Teaching Quality', type: 'RATING_SCALE', value: 4, numericValue: 4 },
      { questionId: 'q4', questionText: 'Practical Code Examples', category: 'Teaching Quality', type: 'YES_NO', value: 'Yes' },
      { questionId: 'q5', questionText: 'Beneficial Aspect', category: 'Teaching Quality', type: 'MULTIPLE_CHOICE', value: 'Live Coding & Debugging' },
      { questionId: 'q6', questionText: 'Overall satisfaction', category: 'Overall Satisfaction', type: 'STAR_RATING', value: 5, numericValue: 5 },
      { questionId: 'q7', questionText: 'Suggestions', category: 'General Feedback', type: 'LONG_TEXT', value: 'Excellent live debugging sessions in class. Would love more microservices case studies.' },
    ],
  });

  // Response from Rohit Sharma for Java form
  await FeedbackResponse.create({
    form: formJava._id,
    student: studentRohit._id,
    teacher: teacherSharma._id,
    department: deptMCA._id,
    course: courseMCA._id,
    academicClass: mcaSY._id,
    semester: mcaSem3._id,
    subject: subjJava._id,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    answers: [
      { questionId: 'q1', questionText: 'Subject Knowledge', category: 'Subject Knowledge', type: 'STAR_RATING', value: 5, numericValue: 5 },
      { questionId: 'q2', questionText: 'Communication', category: 'Communication', type: 'STAR_RATING', value: 4, numericValue: 4 },
      { questionId: 'q3', questionText: 'Teaching Quality', category: 'Teaching Quality', type: 'RATING_SCALE', value: 4, numericValue: 4 },
      { questionId: 'q4', questionText: 'Practical Code Examples', category: 'Teaching Quality', type: 'YES_NO', value: 'Yes' },
      { questionId: 'q5', questionText: 'Beneficial Aspect', category: 'Teaching Quality', type: 'MULTIPLE_CHOICE', value: 'Course Notes & Repositories' },
      { questionId: 'q6', questionText: 'Overall satisfaction', category: 'Overall Satisfaction', type: 'STAR_RATING', value: 4, numericValue: 4 },
      { questionId: 'q7', questionText: 'Suggestions', category: 'General Feedback', type: 'LONG_TEXT', value: 'Very thorough explanations and well-structured GitHub starter repositories.' },
    ],
  });

  console.log('[Seed] Seeding Attendance Records...');
  const date1 = new Date();
  date1.setDate(date1.getDate() - 1);
  date1.setHours(0, 0, 0, 0);

  const date2 = new Date();
  date2.setDate(date2.getDate() - 2);
  date2.setHours(0, 0, 0, 0);

  await Attendance.create([
    {
      date: date1,
      subject: subjJava._id,
      teacher: teacherSharma._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      records: [
        { student: studentRahul._id, status: 'PRESENT', remarks: 'Active in class' },
        { student: studentAnanya._id, status: 'PRESENT', remarks: 'Completed lab challenge' },
        { student: studentRohit._id, status: 'LATE', remarks: 'Joined 10 mins in' },
      ],
    },
    {
      date: date2,
      subject: subjJava._id,
      teacher: teacherSharma._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      records: [
        { student: studentRahul._id, status: 'PRESENT', remarks: '' },
        { student: studentAnanya._id, status: 'PRESENT', remarks: '' },
        { student: studentRohit._id, status: 'PRESENT', remarks: '' },
      ],
    },
    {
      date: date1,
      subject: subjCloud._id,
      teacher: teacherPatel._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      records: [
        { student: studentRahul._id, status: 'PRESENT', remarks: 'Demonstrated Terraform script' },
        { student: studentAnanya._id, status: 'PRESENT', remarks: '' },
        { student: studentRohit._id, status: 'ABSENT', remarks: 'Medical leave' },
      ],
    },
  ]);

  console.log('[Seed] Seeding Teacher Evaluations...');
  await TeacherFeedback.create([
    {
      teacher: teacherSharma._id,
      student: studentRahul._id,
      subject: subjJava._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      academicPerformance: 'EXCELLENT',
      participation: 5,
      attendancePercentage: 94,
      strengths: 'Strong object-oriented design intuition and consistent problem-solving skills.',
      areasOfImprovement: 'Focus on writing comprehensive unit tests for backend APIs.',
      remarks: 'Consistently among top performers in the practical lab sessions.',
      date: new Date(),
    },
    {
      teacher: teacherSharma._id,
      student: studentAnanya._id,
      subject: subjJava._id,
      department: deptMCA._id,
      course: courseMCA._id,
      academicClass: mcaSY._id,
      semester: mcaSem3._id,
      academicPerformance: 'EXCELLENT',
      participation: 5,
      attendancePercentage: 98,
      strengths: 'Outstanding code clarity, great teamwork, and fast comprehension of framework architectures.',
      areasOfImprovement: 'Explore advanced caching mechanisms (e.g. Redis) for enterprise applications.',
      remarks: 'Exemplary project submission for Spring Boot integration.',
      date: new Date(),
    },
  ]);

  console.log('[Seed] Seeding Complaints & Concerns...');
  await Complaint.create([
    {
      title: 'Lab 3 High-Performance Workstation Network Latency',
      description: 'The desktop terminals in Lab 3 have intermittent DNS lookup delays when connecting to external Docker registries.',
      category: 'INFRASTRUCTURE',
      priority: 'MEDIUM',
      createdBy: studentRahul._id,
      department: deptMCA._id,
      status: 'RESOLVED',
      adminResponse: 'Network switch in Rack B was rebooted and upgraded with new routing firmware. Verified 1Gbps throughput.',
      resolvedAt: new Date(),
      resolvedBy: adminUser._id,
    },
    {
      title: 'Request for Additional Extended Library Hours During Midterms',
      description: 'Requesting the central reading room remain open until 10:00 PM during upcoming mid-term evaluation week.',
      category: 'ADMINISTRATIVE',
      priority: 'LOW',
      createdBy: parentVerma._id,
      status: 'OPEN',
    },
  ]);

  console.log('[Seed] Seeding Notifications...');
  await Notification.create([
    {
      recipient: studentRahul._id,
      title: 'New Feedback Form Available',
      message: 'Mid-Semester Student Feedback for Advanced Java Programming is open for your submission.',
      type: 'FEEDBACK_AVAILABLE',
      link: '/student/forms',
      isRead: false,
    },
    {
      recipient: parentVerma._id,
      title: 'New Teacher Evaluation Published',
      message: 'Prof. Ramesh Sharma has published academic remarks on Rahul Verma’s performance.',
      type: 'TEACHER_FEEDBACK',
      link: '/parent/feedback',
      isRead: false,
    },
    {
      recipient: teacherSharma._id,
      title: 'Feedback Participation Update',
      message: '2 out of 3 enrolled students (66.7%) have submitted feedback for Advanced Java Programming.',
      type: 'SYSTEM',
      link: '/teacher/feedback',
      isRead: false,
    },
  ]);

  console.log('\n======================================================');
  console.log(' SEEDING COMPLETED SUCCESSFULLY! REAL DATA LOADED.');
  console.log('======================================================');
  console.log('DEMO CREDENTIALS:');
  console.log('1. ADMIN:   admin@apexinstitute.edu       / Admin@123');
  console.log('2. TEACHER: prof.sharma@apexinstitute.edu / Teacher@123');
  console.log('3. STUDENT: rahul.verma@student.edu       / Student@123 (MCA SY Sem III, Pending Form)');
  console.log('4. PARENT:  parent.verma@parent.edu       / Parent@123 (Parent of Rahul Verma)');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
