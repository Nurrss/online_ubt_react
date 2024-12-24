import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AnalysisExam } from '../pages/AnalysisExam/AnalysisExam';
import GeneralProfile from '../pages/GeneralProfile/GeneralProfile';
import { Students } from '../pages/StudentsTable/StudentsTable';
import { Teachers } from '../pages/TeachersTable/TeachersTable';
import DoneExam from '../pages/DoneExams/DoneExams';
import { ExamResults } from '../pages/ExamResults/ExamResults';
import { ExamAnalyse } from '../pages/ExamAnalyse';
import AdminLayout from '../layouts/AdminLayout';
import Subjects from '../pages/Subjects/Subjects';
import ClassDoneExam from '../pages/ClassDoneExams/ClassDoneExams';

const AdminRoutes = ({ navigateToLogin }) => {
  return (
    <AdminLayout navigateToLogin={navigateToLogin}>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/exam_analyse" element={<ExamAnalyse />} />
        <Route path="/profile" element={<GeneralProfile />} />
        <Route path="/exams_admin" element={<AnalysisExam />} />
        <Route path="/students_done_exam" element={<DoneExam />} />
        <Route path="/exam_results" element={<ExamResults />} />
        <Route path="/done_exams" element={<ClassDoneExam />} />
        <Route path="/profile" element={<GeneralProfile />} />
        <Route path="/students" element={<Students />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/teachers" element={<Teachers />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
