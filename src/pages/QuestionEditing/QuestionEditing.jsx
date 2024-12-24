import styles from './QuestionEditing.module.css';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { sizes } from '../../base/sizes';
import Input from 'antd/es/input/Input';
import AddImage from '../../assets/icons/add_image_icon.png';
import axios from 'axios';
import config from '../../../config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import Loader from '../../components/organism/Loader/Loader';
import { LanguageContext } from '../../contexts/LanguageContext';

export const QuestionEditing = () => {
  const [lastClickedButton, setLastClickedButton] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [answers, setAnswers] = useState([
    { id: uuidv4(), text: '', isCorrect: false },
    { id: uuidv4(), text: '', isCorrect: false },
    { id: uuidv4(), text: '', isCorrect: false },
    { id: uuidv4(), text: '', isCorrect: false }
  ]);
  const [type, setType] = useState(1); // Default to 1-point question
  const [maxCorrectAnswers, setMaxCorrectAnswers] = useState(1);

  const [language, setLanguage] = useState('kz');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const questionData = location.state?.questionData || {};
  // console.log(answers);

  useEffect(() => {
    setQuestion(questionData.question);
    setAnswers(questionData.options);
    setImage(questionData.image);
    setType(questionData.point);
    setLastClickedButton(questionData.point);
    setLanguage(questionData.language);
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchSubjects() {
      try {
        const response = await axios.get(`${config.baseURL}/subjects/`);
        setSubjects(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }

    fetchSubjects();
  }, []);

  useEffect(() => {
    const teachersSubject = localStorage.getItem('teachersSubject');
    console.log('teachersSubject', teachersSubject);
    if (teachersSubject) {
      async function fetchTopics() {
        setLoading(true);
        try {
          const response = await axios.get(`${config.baseURL}/subjects/${teachersSubject}`);
          console.log('topics: ', response.data.topics);
          setTopics(response.data.topics);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false); // Stop loading
        }
      }

      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  const handleButtonClick = (buttonNumber) => {
    setLastClickedButton(buttonNumber);
    setType(buttonNumber);
    const updatedAnswers = answers.map((answer) => ({ ...answer, isCorrect: false }));
    setAnswers(updatedAnswers);
    setMaxCorrectAnswers(buttonNumber === 1 ? 1 : answers.length);
    if (buttonNumber === 1 && answers.length > 4) {
      setAnswers(answers.slice(0, 4));
    }
  };

  const handleAnswerChange = (index, text) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].text = text;
    setAnswers(updatedAnswers);
  };

  const handleToggleCorrectAnswer = (index) => {
    const updatedAnswers = [...answers];
    if (type === 1) {
      updatedAnswers.forEach((answer, idx) => {
        answer.isCorrect = idx === index;
      });
    } else {
      updatedAnswers[index].isCorrect = !updatedAnswers[index].isCorrect;
      const numCorrectAnswers = updatedAnswers.filter((ans) => ans.isCorrect).length;
      if (numCorrectAnswers > maxCorrectAnswers) {
        updatedAnswers[index].isCorrect = false;
      }
    }
    setAnswers(updatedAnswers);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!lastClickedButton) {
      alert(language === 'kz' ? 'Сұрақ түрін таңдаңыз.' : 'Выберите тип вопроса.');
      setLoading(false);
      return;
    }

    if (!selectedTopic) {
      alert(language === 'kz' ? 'Тақырып таңдаңыз.' : 'Выберите тему.');
      setLoading(false);
      return;
    }

    if (!question && !image) {
      alert(
        language === 'kz'
          ? 'Сұрақ немесе сурет еңгізіңіз.'
          : 'Введите текст вопроса или добавьте изображение.'
      );
      setLoading(false);
      return;
    }

    const allAnswersFilled = answers.every((answer) => answer.text.trim() !== '');
    if (!allAnswersFilled) {
      alert(
        language === 'kz' ? 'Барлық жауап нұсқаларын еңгізіңіз.' : 'Заполните все варианты ответов.'
      );
      setLoading(false);
      return;
    }

    const atLeastOneCorrect = answers.some((answer) => answer.isCorrect);
    if (!atLeastOneCorrect) {
      alert(
        language === 'kz'
          ? 'Кем дегенде бір дұрыс жауап еңгізіңіз.'
          : 'Выберите хотя бы один правильный ответ.'
      );
      setLoading(false);
      return;
    }

    const correctOptions = answers.filter((answer) => answer.isCorrect).map((answer) => answer.id);

    if (
      type === 2 &&
      (answers.filter((answer) => answer.isCorrect).length < 1 ||
        answers.filter((answer) => answer.isCorrect).length > 3)
    ) {
      alert(
        language === 'kz'
          ? 'Дұрыс жауаптар саны сай емес! 1 ден 3 ке дейін'
          : 'Количество правильных ответов не соответсвует! От 1 до 3'
      );
      setLoading(false);
      return;
    }

    const questionType = type === 1 ? 'onePoint' : 'twoPoints';
    // const editedQuestion = {
    //   question: question,
    //   image: image,
    //   options: answers,
    //   type: questionType,
    //   topicId: selectedTopic,
    //   language: language
    // };

    // console.log('editedQuestion', editedQuestion);

    const formData = new FormData();
    formData.append('type', questionType);
    formData.append('topicId', selectedTopic);
    formData.append('question', question);
    formData.append('language', language);

    // Append answers array as JSON string
    formData.append('options', JSON.stringify(answers));
    console.log('formData', formData);

    // Append image if it exists
    if (image) {
      formData.append('image', image);
      console.log('image', image);
    }

    try {
      const response = await axios.put(
        `${config.baseURL}/question/updateQuestionWithImage/${questionData._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log(response.data);
      handleReset();
      navigate('/question_list');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleReset = () => {
    setLastClickedButton(null);
    setType(1);
    setSelectedSubject('');
    setSelectedTopic('');
    setQuestion('');
    setImage(null);
    setImagePreviewUrl('');
    setAnswers([
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false }
    ]);
  };

  const handleLanguageToggle = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'kz' ? 'ru' : 'kz'));
  };

  const addNewOption = () => {
    if (answers.length < 8) {
      setAnswers([...answers, { id: uuidv4(), text: '', isCorrect: false }]);
    } else {
      alert(language === 'kz' ? 'Ең көп жауап 8 болуы мүмкін.' : 'Максимум 8 ответов.');
    }
  };

  const removeOption = (index) => {
    if (answers.length > 4) {
      const updatedAnswers = answers.filter((_, i) => i !== index);
      setAnswers(updatedAnswers);
    } else {
      alert(
        language === 'kz'
          ? 'Төрт жауаптан кем болуы мүмкін емес.'
          : 'Нельзя иметь меньше четырех ответов.'
      );
    }
  };

  const renderCorrectAnswerToggle = (index) => {
    return (
      <div
        className={`${styles.correctAnswerToggle} ${answers[index].isCorrect ? styles.correct : ''}`}
        onClick={() => handleToggleCorrectAnswer(index)}
      >
        {answers[index].isCorrect ? <CheckOutlined /> : <CloseOutlined />}
      </div>
    );
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles.outContainer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>{language === 'kz' ? 'Сұрақ өзгерту' : 'Изменение вопроса'}</h2>
          <Link to={'/question_list'}>
            <h5>{language === 'kz' ? 'Сұрақтар тізбесі' : 'Список вопросов'}</h5>
          </Link>
        </div>

        <button
          style={{
            padding: '.7rem 1rem',
            backgroundColor: '#009172',
            color: '#fff',
            width: '3rem',
            borderRadius: '.5rem'
          }}
          onClick={handleLanguageToggle}
        >
          {language === 'kz' ? 'kz' : 'ru'}
        </button>
        <div className="text-center">
          <div className={`row align-items-start add_content ${styles.mainContainer}`}>
            <div className="col-3">
              <div className={styles.chooseContainer}>
                <h4 className={styles.h4}>
                  {language === 'kz' ? 'Сұрақ түрін таңдаңыз:' : 'Выберите тип вопроса:'}
                </h4>
                <div className={styles.pointContainer}>
                  <button
                    className={`${styles.pointBtn} ${lastClickedButton === 1 ? styles.clickedBtn : ''}`}
                    onClick={() => handleButtonClick(1)}
                  >
                    1 {language === 'kz' ? 'балл' : 'балл'}
                  </button>
                  <button
                    className={`${styles.pointBtn} ${lastClickedButton === 2 ? styles.clickedBtn : ''}`}
                    onClick={() => handleButtonClick(2)}
                  >
                    2 {language === 'kz' ? 'балл' : 'балла'}
                  </button>
                </div>
                <div className={styles.titleSelect}>
                  <h4 className={styles.h4}>
                    {language === 'kz' ? 'Тақырып таңдаңыз:' : 'Выберите тему:'}
                  </h4>
                  <select
                    className={styles.themeSelect}
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="">
                      {language === 'kz' ? 'Тақырып таңдаңыз' : 'Выберите тему'}
                    </option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {language === 'kz' ? topic.kz_title : topic.ru_title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={`col-6 ${styles.chooseContainer}`}>
              <h4 className={styles.h4}>
                {language === 'kz' ? 'Сұрақ енгізіңіз' : 'Введите вопрос'}
              </h4>
              <div className={styles.addingQuestionContainer}>
                <div className={styles.inputImgRow}>
                  <Input
                    placeholder={language === 'kz' ? 'Сұрақ енгізіңіз' : 'Введите текст'}
                    variant="borderless"
                    style={{ borderBottom: 'solid 2px #acacac', borderRadius: '0', width: '100%' }}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="imageUpload">
                    <img src={AddImage} alt="Add image icon" />
                  </label>
                </div>
                {imagePreviewUrl && (
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                    />
                  </div>
                )}
                <div className={styles.approveCancelContent}>
                  <CheckOutlined
                    style={{ fontSize: '24px', fontWeight: 'bold' }}
                    onClick={handleSubmit}
                  />
                  <CloseOutlined
                    style={{ fontSize: '24px', fontWeight: 'bold' }}
                    onClick={handleReset}
                  />
                </div>
              </div>
            </div>
            <div className={`col-3 ${styles.chooseContainer}`}>
              <h4 className={styles.h4}>
                {language === 'kz' ? 'Жауап енгізіңіз' : 'Введите ответы'}
              </h4>
              <div className={styles.choseAnswer}>
                {answers.map((answer, index) => (
                  <div
                    key={answer.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    {renderCorrectAnswerToggle(index)}
                    <input
                      className={`${styles.graduation} ${styles.file_input}`}
                      type="text"
                      placeholder={language === 'kz' ? 'Жауап енгізіңіз' : 'Введите ответ'}
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    {type === 2 && answers.length > 4 && (
                      <CloseOutlined
                        className={styles.removeOption}
                        onClick={() => removeOption(index)}
                      />
                    )}
                  </div>
                ))}
                {type === 2 && answers.length < 8 && (
                  <button onClick={addNewOption} className={styles.addOptionButton}>
                    {language === 'kz' ? 'Қосымша жауап қосу' : 'Добавить еще один ответ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
