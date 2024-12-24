import { useEffect, useState, useContext } from 'react';
import Exam from '../../components/exam/Exam';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';
import styles from './Exams.module.css';

import { LanguageContext } from '../../contexts/LanguageContext';
import Loader from '../../components/organism/Loader/Loader';

const Exams = () => {
  const [upExams, setUpExams] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      try {
        const response = await axios.get('https://ubt-server.vercel.app/exams/');
        const currentDate = moment(); // Get the current date

        // Filter exams where the current date is between startedAt and finishedAt
        const ongoingExams = response.data.filter((exam) => {
          const startedAt = moment(exam.startedAt);
          const finishedAt = moment(exam.finishedAt);
          return currentDate.isBetween(startedAt, finishedAt, null, '[]'); // Inclusive of start and end dates
        });

        setUpExams(ongoingExams);
        console.log('exams:', response.data);
      } catch (error) {
        console.error(error);
        alert(error.message); // Set the error message
      } finally {
        setLoading(false); // Stop loading
      }
    }

    fetchExams();
  }, []);

  const handleExamClick = (examId) => {
    setSelectedExamId(examId);
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles.examContainer}>
        <div className={styles.mainTitle}>
          {language === 'kz' ? 'Алдағы емтихандар' : 'Предстоящие экзамены'}
        </div>
        <div className={styles.examsList}>
          {upExams && upExams.length > 0 ? (
            upExams.map((exam) => (
              <Exam
                key={exam._id}
                startedAt={moment(exam.startedAt).format('HH:mm DD/MM/YY')}
                examId={exam._id}
                finishedAt={moment(exam.finishedAt).format('HH:mm DD/MM/YY')}
                onClick={handleExamClick}
                isSelected={exam._id === selectedExamId}
              />
            ))
          ) : (
            <p>{language === 'kz' ? 'Емтихандар жоқ...' : 'Экзаменов нет...'}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Exams;
