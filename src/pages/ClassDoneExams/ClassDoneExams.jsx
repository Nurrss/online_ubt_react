import { useEffect, useState, useContext } from 'react';
import FinishedExam from '../../components/exam/FinishedExam';
import axios from 'axios';
import styles from './ClassDoneExams.module.css';
import { useParams } from 'react-router-dom';

import { LanguageContext } from '../../contexts/LanguageContext';
import Loader from '../../components/organism/Loader/Loader';

const ClassDoneExam = () => {
  const [doneExams, setDoneExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const { studentId } = useParams();

  useEffect(() => {
    async function fetchDoneExams() {
      setLoading(true);
      const studentId = localStorage.getItem('studentId');

      if (studentId) {
        console.log('studentId: ', studentId);
        try {
          const response = await axios.get(
            `https://ubt-server.vercel.app/students/getAllResultsForStudent/${studentId}`
          );
          setDoneExams(response.data.results);
          localStorage.removeItem('studentId');
          console.log(response.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false); // Stop loading
        }
      } else {
        console.error('User data not found');
        setLoading(false);
      }
    }

    fetchDoneExams();
  }, []);

  return (
    <>
      {loading && <Loader />}
      <div className={styles.examContainer}>
        <div className={styles.mainTitle}>
          {language === 'kz' ? 'Студент тапсырған емтихандар' : 'Сданные экзамены студента'}
        </div>
        <div className={styles.examsList}>
          {doneExams.length > 0 ? (
            doneExams.map((exam, index) => (
              <FinishedExam
                key={index}
                time={exam.time}
                day={exam.day}
                points={exam.overallPoints}
                studentId={exam.studentId}
                examId={exam.examId}
              />
            ))
          ) : (
            <div>{language === 'kz' ? 'Емтихандар табылған жоқ' : 'Экзамены не найдены'}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClassDoneExam;
