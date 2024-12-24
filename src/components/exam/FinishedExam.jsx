import './Exam.css';
import { Link, useNavigate } from 'react-router-dom';

import { useContext } from 'react';
import timeIcon from '../../assets/img/icons/time-icon.svg';
import dateIcon from '../../assets/img/icons/date-icon.svg';
import axios from 'axios';
import { useState } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import Loader from '../../components/organism/Loader/Loader';

const FinishedExam = ({
  // time, day,
  points,
  studentId,
  examId
}) => {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const GetResultByIds = async () => {
    setLoading(true);
    const resultData = {
      studentId: studentId,
      examId: examId
    };
    console.log('results', resultData);
    try {
      const response = await axios.post(
        'https://ubt-server.vercel.app/students/getResult',
        resultData
      );
      console.log('total result: ', response.data);
      navigate('/exam_results', { state: { resultData: response.data, studentId: studentId } });
    } catch (error) {
      console.error('Error getting result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <li className="exams__card">
        <div className="exams__card-title">ЕНТ</div>
        {/* <div className="exams__card__list">
          <div className="exams__card__list-text">{language == 'kz' ? 'Уақыты' : 'Время'}</div>
          <div className="exams_card__list-container">
            <img className="exams__card__list-img" src={timeIcon} alt="" />
            <p>{time}</p>
          </div>
        </div>
        <div className="exams__card__list">
          <div className="exams__card__list-text">{language == 'kz' ? 'Күн' : 'День'}</div>
          <div className="exams_card__list-container">
            <img className="exams__card__list-img" src={dateIcon} alt="" />
            <p>{day}</p>
          </div>
        </div> */}
        <div className="exams__card__list">
          <div className="exams__card__list-text">{language == 'kz' ? 'Баллдар' : 'Баллы'}</div>
          <div className="exams_card__list-container">
            <img className="exams__card__list-img" src={dateIcon} alt="" />
            <p>{points} балл</p>
          </div>
        </div>
        <div className="exams__card__button">
          <Link onClick={GetResultByIds} className="exams__card__button-btn main__btn">
            {language == 'kz' ? 'Қосымша' : 'Подробнее'}
          </Link>
        </div>
      </li>
    </>
  );
};

export default FinishedExam;
