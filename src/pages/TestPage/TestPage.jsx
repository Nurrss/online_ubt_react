import React, { useState, useEffect } from 'react';
import {
  ClockCircleOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  AppstoreOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionBar from '../../components/organism/QuestionBar/QuestionsBar';
import { Text } from '../../components/atoms/CustomText/CustomText';
import axios from 'axios';
import './TestPage.css';
import moment from 'moment';

import Loader from '../../components/organism/Loader/Loader';

const TextIcon = ({ bgColor, text, color }) => {
  return (
    <div className="iconTextContainer" style={{ backgroundColor: `${bgColor}`, color: `${color}` }}>
      <ClockCircleOutlined height="30px" width="30px" />
      <p>{text}</p>
    </div>
  );
};

export const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const examData = location.state?.examData || {};
  const startExam = location.state?.startExam || {};
  const startedAt = location.state?.startedAt || {};

  const subjects = examData.exam.subjects || [];
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedSubjectName, setSelectedSubjectName] = useState(subjects[0]?.subjectName || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60);

  const [loading, setLoading] = useState(false);

  const selectedQuestions =
    subjects.find((subject) => subject.id === selectedSubjectId)?.questions || [];

  useEffect(() => {
    clearLocalStorage();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleConfirm();
    }
  }, [timeLeft]);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`${selectedSubjectId}-${currentIndex}`);
    if (savedAnswers) {
      setLoading(true);
      try {
        setSelectedAnswers(JSON.parse(savedAnswers));
        setAnsweredQuestions((prev) => [...new Set([...prev, currentIndex])]);
      } catch (error) {
        console.error('Error parsing saved answers:', error);
        setSelectedAnswers([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedAnswers([]);
    }
  }, [selectedSubjectId, currentIndex]);

  const clearLocalStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${selectedSubjectId}-`)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('answers');
  };

  const handleSubjectSelect = async (subjectId) => {
    setLoading(true);
    await saveAnswerToLocalStorage();
    const subject = subjects.find((subject) => subject.id === subjectId);
    setSelectedSubjectId(subjectId);
    setSelectedSubjectName(subject?.subjectName || '');
    setCurrentIndex(0);
    const savedAnswers = localStorage.getItem(`${subjectId}-0`);
    setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
    setAnsweredQuestions([]);
    setLoading(false);
  };

  const handleNext = async () => {
    setLoading(true);
    await saveAnswerToLocalStorage();
    console.log(localStorage.getItem('answers'));
    if (currentIndex < selectedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const savedAnswers = localStorage.getItem(`${selectedSubjectId}-${currentIndex + 1}`);
      setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
    } else {
      const currentSubjectIndex = subjects.findIndex((subject) => subject.id === selectedSubjectId);
      if (currentSubjectIndex < subjects.length - 1) {
        const nextSubjectId = subjects[currentSubjectIndex + 1].id;
        setSelectedSubjectId(nextSubjectId);
        setSelectedSubjectName(subjects[currentSubjectIndex + 1].subjectName);
        setCurrentIndex(0);
        const savedAnswers = localStorage.getItem(`${nextSubjectId}-0`);
        setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
        setAnsweredQuestions([]);
      }
    }
    setLoading(false);
  };

  const handlePrevious = async () => {
    setLoading(true);
    await saveAnswerToLocalStorage();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const savedAnswers = localStorage.getItem(`${selectedSubjectId}-${currentIndex - 1}`);
      setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
    } else {
      const currentSubjectIndex = subjects.findIndex((subject) => subject.id === selectedSubjectId);
      if (currentSubjectIndex > 0) {
        const previousSubjectId = subjects[currentSubjectIndex - 1].id;
        setSelectedSubjectId(previousSubjectId);
        setSelectedSubjectName(subjects[currentSubjectIndex - 1].subjectName);
        setCurrentIndex(subjects[currentSubjectIndex - 1].questions.length - 1);
        const savedAnswers = localStorage.getItem(
          `${previousSubjectId}-${subjects[currentSubjectIndex - 1].questions.length - 1}`
        );
        setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
        setAnsweredQuestions([]);
      }
    }
    setLoading(false);
  };

  const handleQuestionButtonClick = async (index) => {
    setLoading(true);
    await saveAnswerToLocalStorage();
    setCurrentIndex(index);
    const savedAnswers = localStorage.getItem(`${selectedSubjectId}-${index}`);
    setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
    setLoading(false);
  };

  const handleOptionChange = (optionId) => {
    const currentQuestion = selectedQuestions[currentIndex];
    let newSelectedAnswers;

    if (currentQuestion.type === 'onePoint') {
      newSelectedAnswers = [optionId];
    } else if (currentQuestion.type === 'twoPoints') {
      newSelectedAnswers = selectedAnswers.includes(optionId)
        ? selectedAnswers.filter((id) => id !== optionId)
        : [...selectedAnswers, optionId];
    }

    setSelectedAnswers(newSelectedAnswers);
    setAnsweredQuestions((prev) => [...new Set([...prev, currentIndex])]);
  };

  const formatDate = () => {
    return moment().format('HH:mm DD/MM/YY');
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const saveAnswerToLocalStorage = async () => {
    const currentQuestion = selectedQuestions[currentIndex];
    const answerData = {
      examId: startExam.examId,
      studentId: startExam.studentId,
      subjectId: selectedSubjectId,
      questionId: currentQuestion._id,
      optionIds: selectedAnswers,
      questionNumber: currentQuestion.questionNumber,
      language: startExam.language
    };

    const answers = JSON.parse(localStorage.getItem('answers')) || [];
    const existingAnswerIndex = answers.findIndex(
      (answer) =>
        answer.subjectId === selectedSubjectId && answer.questionId === currentQuestion._id
    );

    if (existingAnswerIndex !== -1) {
      answers[existingAnswerIndex] = answerData;
    } else {
      answers.push(answerData);
      console.log('answer is: ', answerData);
    }

    localStorage.setItem('answers', JSON.stringify(answers));
    localStorage.setItem(`${selectedSubjectId}-${currentIndex}`, JSON.stringify(selectedAnswers));
  };

  const submitAnswersToBackend = async (answers) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://ubt-server.vercel.app/students/submitOrUpdateAnswer',
        { answers }
      );
      console.log('submitAnswer', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getResultFromBackend = async (resultData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://ubt-server.vercel.app/students/getResult',
        resultData
      );
      console.log('total result: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    const timeSpent = 3 * 60 * 60 - timeLeft;
    const finishedAt = formatDate();
    const resultData = {
      examId: startExam.examId,
      studentId: startExam.studentId
      // startedAt: startedAt,
      // finishedAt: finishedAt,
      // timeSpent: timeSpent
    };

    console.log('resultData', resultData);

    try {
      // First, submit the answers

      // Then, get the result
      await getResultFromBackend(resultData);
      const result = await getResultFromBackend(resultData);
      console.log('result', result);
      navigate('/exam_results', { state: { resultData: result } });
    } catch (error) {
      console.error('Error in handleConfirm:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAnswered = (index) => {
    const savedAnswers = localStorage.getItem(`${selectedSubjectId}-${index}`);
    return savedAnswers && JSON.parse(savedAnswers).length > 0;
  };

  const [popupVisible, setPopupVisible] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [popupVisible2, setPopupVisible2] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
    setButtonClicked(!buttonClicked);
  };

  const togglePopup2 = async () => {
    setLoading(true);
    const answers = JSON.parse(localStorage.getItem('answers')) || [];
    console.log('answers are: ', answers);
    await saveAnswerToLocalStorage();

    try {
      await submitAnswersToBackend(answers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    setPopupVisible2(!popupVisible2);
  };

  const getGoogleDriveImageUrl = (fileId) => ` https://drive.google.com/thumbnail?id=${fileId}`;

  return (
    <>
      {loading && <Loader />}
      {popupVisible && (
        <div className="popupContainer">
          <QuestionBar
            subjects={subjects.map((subject) => ({
              id: subject.id,
              name: subject.subjectName
            }))}
            text={`${answeredQuestions.length} / ${selectedQuestions.length}`}
            onSelect={(subjectId) => handleSubjectSelect(subjectId)}
            selectedQuestions={selectedQuestions}
            handleQuestionButtonClick={handleQuestionButtonClick}
            isAnswered={isAnswered}
            currentIndex={currentIndex}
            selectedSubjectId={selectedSubjectId} // Pass selectedSubjectId to QuestionBar
          />
          <button onClick={togglePopup}>Close</button>
        </div>
      )}
      {popupVisible2 && (
        <div className="popupContainer">
          <WarningOutlined className="warningIcon" />
          <p>Вы хотите завершить экзамен сейчас?</p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            <button className="confirmButton" onClick={handleConfirm}>
              Да
            </button>
            <button className="cancelButton" onClick={togglePopup2}>
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className={`testContainer ${popupVisible ? 'bgShadow' : ''}`}>
        <div className="mainContainer">
          <div className={`responsiveContainer ${popupVisible ? 'hidden' : ''}`}>
            <QuestionBar
              subjects={subjects.map((subject) => ({
                id: subject.id,
                name: subject.subjectName
              }))}
              text={`${answeredQuestions.length} / ${selectedQuestions.length}`}
              onSelect={(subjectId) => handleSubjectSelect(subjectId)}
              selectedQuestions={selectedQuestions}
              handleQuestionButtonClick={handleQuestionButtonClick}
              isAnswered={isAnswered}
              currentIndex={currentIndex}
              selectedSubjectId={selectedSubjectId} // Pass selectedSubjectId to QuestionBar
            />
          </div>
        </div>
        {selectedQuestions.length > 0 ? (
          <div className="mainContent">
            <div className="givenTaskContainer">
              <div className="mainInfo">
                <Text weight="700">{`${selectedSubjectName}. Вопрос ${currentIndex + 1} из ${selectedQuestions.length}`}</Text>
                <div className="timerContainer">
                  <TextIcon bgColor="white" text={formatTime(timeLeft)} color="black" />
                </div>
              </div>
              <div className="questionContainer">
                <Text type="large" weight="400">
                  {selectedQuestions[currentIndex]?.question}
                </Text>
                {selectedQuestions[currentIndex]?.image && (
                  <img
                    src={getGoogleDriveImageUrl(
                      selectedQuestions[currentIndex].image.split('/')[5]
                    )}
                    alt="Question related"
                  />
                )}
              </div>
            </div>
            <div className="rightSideInfo">
              <div className="answerBlock">
                <div className="prevNextBtnsContainer">
                  <div className="iconButton" onClick={handlePrevious}>
                    <LeftCircleOutlined className="btnIcon" />
                    <h5>Предыдущий</h5>
                  </div>
                  <button
                    style={{ width: '40%', height: '40px' }}
                    className={`popup-button`}
                    onClick={togglePopup}
                  >
                    <AppstoreOutlined className={`${buttonClicked ? 'clicked' : ''}`} />
                  </button>
                  <div className="iconButton" onClick={handleNext}>
                    <h5>Следующий</h5>
                    <RightCircleOutlined className="btnIcon" />
                  </div>
                </div>
                <div className="choicesContainer">
                  {selectedQuestions[currentIndex]?.options?.map((option) => (
                    <label key={option._id} className="radioLabel">
                      <input
                        type={
                          selectedQuestions[currentIndex].type === 'onePoint' ? 'radio' : 'checkbox'
                        }
                        value={option._id}
                        checked={selectedAnswers.includes(option._id)}
                        onChange={() => handleOptionChange(option._id)}
                      />
                      {option.text}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={togglePopup2}>Завершить тест</button>
            </div>
          </div>
        ) : (
          <div className="noQuestionsContainer">
            <Text type="testQuestion">Нет доступных вопросов по выбранному предмету.</Text>
          </div>
        )}
      </div>
    </>
  );
};
