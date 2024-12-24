import React, { useState, useEffect, useContext } from 'react';
import styles from './QuestionList.module.css';
import axios from 'axios';
import { LanguageContext } from '../../contexts/LanguageContext';
import Loader from '../../components/organism/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const QuestionList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('kz'); // Default language
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  async function fetchTopicsQuestions() {
    setLoading(true);
    const teachersSubject = localStorage.getItem('teachersSubject');
    console.log('teachersSubject', teachersSubject);
    try {
      const response = await axios.get(`https://ubt-server.vercel.app/subjects/${teachersSubject}`);
      console.log('topics: ', response.data.topics);
      setTopics(response.data.topics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  useEffect(() => {
    fetchTopicsQuestions();
  }, []);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
  };

  const handleEditQuestion = (questionData) => {
    navigate('/question_edit', { state: { questionData: questionData } });
  };

  // const handleDeleteQuestion = async (questionId) => {
  //   try {
  //     const response = await axios.delete(`https://ubt-server.vercel.app/question/${questionId}`);
  //     console.log('Delete response:', response.data);

  //     // Update the topics state to remove the deleted question
  //     setTopics((prevTopics) =>
  //       prevTopics.map((topic) => ({
  //         ...topic,
  //         kzQuestionsInfo: topic.kzQuestionsInfo.filter((q) => q._id !== questionId),
  //         ruQuestionsInfo: topic.ruQuestionsInfo.filter((q) => q._id !== questionId)
  //       }))
  //     );
  //   } catch (error) {
  //     console.error('Error deleting question:', error);
  //   }
  // };

  const getGoogleDriveImageUrl = (fileId) => ` https://drive.google.com/thumbnail?id=${fileId}`;

  return (
    <>
      {loading && <Loader />}
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles.languageSwitcher}>
            <button
              onClick={() => handleLanguageChange('kz')}
              className={selectedLanguage === 'kz' ? styles.activeLanguage : ''}
            >
              Kazakh
            </button>
            <button
              onClick={() => handleLanguageChange('ru')}
              className={selectedLanguage === 'ru' ? styles.activeLanguage : ''}
            >
              Russian
            </button>
          </div>
          <Link to="/new_task">
            <h5>{language === 'kz' ? 'Сұрақ қосу' : 'Добавить вопрос'}</h5>
          </Link>
        </div>
        {topics.map((topic) => (
          <div key={topic._id} className={styles.topic}>
            <h2>{selectedLanguage === 'kz' ? topic.kz_title : topic.ru_title}</h2>
            <div className={styles.questions}>
              {(selectedLanguage === 'kz' ? topic.kzQuestionsInfo : topic.ruQuestionsInfo).map(
                (question) => (
                  <div key={question._id} className={styles.question}>
                    <div className={styles.questionHeader}>
                      <h3>{question.question}</h3>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className={styles.deleteButton}
                      >
                        Едит
                      </button>
                    </div>
                    {question.image && (
                      <div className={styles.imageContainer}>
                        <img
                          src={getGoogleDriveImageUrl(question.image.split('/')[5])} // Extract file ID from URL
                          alt="Question"
                          className={styles.questionImage}
                        />
                      </div>
                    )}
                    <div className={styles.options}>
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`${styles.option} ${option.isCorrect ? styles.correctOption : ''}`}
                        >
                          <span>{option.text}</span>
                          <div>
                            <button onClick={() => handleEditOption(question._id, option._id)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button onClick={() => handleDeleteOption(question._id, option._id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
