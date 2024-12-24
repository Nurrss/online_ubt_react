import React from 'react';
import styled from 'styled-components';
import { colors } from '../../base/colors';
import { Text } from '../../components/atoms/CustomText/CustomText';
import styles from './ExamResults.module.css';
import { CustomButton } from '../../components/atoms/CustomButton/CustomButton';
import { ArrowDownOutlined } from '@ant-design/icons';
import { PointChart } from '../PointChart.jsx';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/organism/Loader/Loader';
import axios from 'axios';

const ResultPoints = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  width: 100%;

  @media screen and (max-width: 1000px) {
    flex-wrap: wrap;
    order: 2;
  }
`;

const ContainerInfo = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;

  @media screen and (max-width: 1200px) {
    flex-wrap: wrap;
    order: 1;
  }
`;

const EstimateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 2rem;

  @media screen and (max-width: 1000px) {
    flex-wrap: wrap;
    order: 3;
  }
`;

const AnalyseTopContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 3rem;
  width: 100%;

  @media screen and (max-width: 1000px) {
    order: 3;
    flex-direction: column;
    gap: 2rem;
  }
`;

const TwoTextButton = styled.button`
  background-color: ${colors.black_green};
  width: 40%;
  height: 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  gap: 2rem;

  @media screen and (max-width: 1000px) {
    ${Text} {
      display: none;
    }
  }
`;

const GeneralInfo = styled.div`
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;

  & > *:first-child {
    text-align: left;
    font-weight: medium;
  }

  & > *:last-child {
    text-align: right;
    font-weight: bold;
  }
`;

const SuccessIndicator = styled.div`
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
`;

const ScaleScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 230px;

  & > *:first-child {
    text-align: left;
    font-weight: medium;
    width: 130px;
  }

  & > *:last-child {
    text-align: right;
    font-weight: bold;
  }
`;

const ScaleInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > *:first-child {
    text-align: left;
    font-weight: medium;
    width: 150px;
  }

  & > *:last-child {
    text-align: right;
    font-weight: bold;
  }
`;

const SubjectEstimateContainer = styled.div`
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
`;

const SubjectEstimateRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: start;
  align-items: center;

  & > *:first-child {
    text-align: left;
    font-weight: medium;
    width: 200px;
  }
`;

const AnalyseByTheme = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  padding: 1rem;
  align-items: start;
  width: 40rem;
  gap: 1rem;
`;

const AnalyseRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const ChartCont = styled.div`
  display: flex;
  width: 100%;

  @media screen and (max-width: 1000px) {
    order: 3;
  }
`;

const Element = styled.div`
  padding: 10px;
`;

const ScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
`;

const formatPercentage = (percent) => {
  const formattedPercent = parseFloat(percent).toFixed(1);
  return formattedPercent.endsWith('.0')
    ? formattedPercent.slice(0, -2) + '%'
    : formattedPercent + '%';
};

export const ExamResults = () => {
  const location = useLocation();
  const resultData = location.state?.resultData || {};
  const studentId = location.state?.studentId || {};
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDoneExams() {
      setLoading(true);
      const user_data = JSON.parse(localStorage.getItem('user_data'));

      const idStudent = studentId || user_data.secondId;

      console.log('idStudent', studentId);

      if (idStudent) {
        console.log('studentId: ', idStudent);

        try {
          const response = await axios.get(
            `https://ubt-server.vercel.app/students/getAllResultsForStudent/${idStudent}`
          );
          setChartData(response.data.results);
          console.log(response.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false); // Stop loading
        }
      } else {
        console.error('User data not found in local storage');
        setLoading(false);
      }
    }

    fetchDoneExams();
  }, []);

  console.log('chartData', chartData);

  const maxDisplayItems = 10;

  const studentResult = resultData.result || {};
  const subjects = studentResult.subjects || [];

  return (
    <>
      {loading && <Loader />}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '2rem' }}>
        <Text type="largex">Результаты экзамена</Text>
        <ResultPoints>
          <TwoTextButton>
            <Text color={colors.white}>Общий балл</Text>
            <Text type="large2xPlus" color={colors.white} fontWeight="500">
              {studentResult.overallScore}
              {console.log('studentResult', studentResult.result)}
            </Text>
          </TwoTextButton>
          <TwoTextButton>
            <Text color={colors.white}>Достижение</Text>
            <Text type="large2xPlus" color={colors.white} fontWeight="500">
              {formatPercentage(studentResult.overallPercent)}
            </Text>
          </TwoTextButton>
          <TwoTextButton>
            <Text color={colors.white}>Правильных</Text>
            <Text type="large2xPlus" color={colors.white} fontWeight="500">
              {studentResult.totalCorrect}
            </Text>
          </TwoTextButton>
          <TwoTextButton>
            <Text color={colors.white}>Не правильных</Text>
            <Text type="large2xPlus" color={colors.white} fontWeight="500">
              {studentResult.totalIncorrect}
            </Text>
          </TwoTextButton>
        </ResultPoints>
        <ContainerInfo>
          <GeneralInfo>
            <InfoRow>
              <Text type="medium">Имя-Фамилия</Text>
              <Text type="medium">
                {studentResult.student.user?.name} {studentResult.student.user?.surname}
              </Text>
            </InfoRow>
            <InfoRow>
              <Text type="medium">Дата начала</Text>
              <Text type="medium">
                {moment(studentResult.createdAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </InfoRow>
            <InfoRow>
              <Text type="medium">Дата завершения</Text>
              <Text type="medium">
                {moment(studentResult.finishedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </InfoRow>
            <InfoRow>
              <Text type="medium">Продолжительность</Text>
              <Text type="medium">
                {studentResult.durationInHours}:{studentResult.durationInMinutes}:
                {studentResult.durationInSeconds}
              </Text>
            </InfoRow>
          </GeneralInfo>
          <SuccessIndicator>
            {subjects.map((subject, index) => (
              <ScaleInfoRow key={index}>
                <Text>{subject.name}</Text>
                <ScaleScoreRow>
                  <div className={styles.percent}>
                    <div
                      className={styles.progress}
                      style={{ width: `${formatPercentage(subject.percent)}` }}
                    ></div>
                  </div>
                  <Text>
                    {subject.totalCorrect} из {subject.results.length}
                  </Text>
                </ScaleScoreRow>
              </ScaleInfoRow>
            ))}
          </SuccessIndicator>
          <SubjectEstimateContainer>
            {subjects.map((subject, index) => (
              <InfoRow key={index}>
                <Text>{subject.name}</Text>
                <Text>{subject.totalCorrect}</Text>
              </InfoRow>
            ))}
          </SubjectEstimateContainer>
        </ContainerInfo>
        <EstimateContent>
          <Text type="largex">Оценка по предметам</Text>
          {subjects.map((subject, index) => (
            <SubjectEstimateRow key={index}>
              <Element>{subject.name}</Element>
              <div style={{ width: '90%' }}>
                <ScrollContainer>
                  {subject.results.map((result, buttonIndex) => (
                    <button
                      style={{
                        width: '50px',
                        height: '50px',
                        marginRight: '8px',
                        backgroundColor: result.isCorrect ? 'green' : 'red'
                      }}
                      key={buttonIndex}
                    >{`${result.questionNumber ? result.questionNumber : buttonIndex + 1}`}</button>
                  ))}
                </ScrollContainer>
              </div>
            </SubjectEstimateRow>
          ))}
        </EstimateContent>
        <AnalyseTopContent>
          <AnalyseByTheme>
            <Text>Анализ по теме</Text>
            <AnalyseRow>
              <Text color={colors.font_gray}>Предмет</Text>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Text color={colors.font_gray}>Достижение</Text>
                <ArrowDownOutlined style={{ color: `${colors.font_gray}` }} />
              </div>
            </AnalyseRow>
            {subjects.map((subject, index) => (
              <AnalyseRow key={index}>
                {subject.name}
                <CustomButton width="5rem">{`${formatPercentage(subject.percent)}`}</CustomButton>
              </AnalyseRow>
            ))}
          </AnalyseByTheme>
          <AnalyseByTheme style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <Text>Топ 10 участников</Text>
              {resultData.top10Results.slice(0, maxDisplayItems).map((student, index) => (
                <AnalyseRow key={index}>
                  <Text>
                    {index + 1}. {student.name}
                  </Text>
                  <Text>{student.overallPoint}</Text>
                </AnalyseRow>
              ))}
              {resultData.top10Results.length > maxDisplayItems && (
                <AnalyseRow>
                  <Text>...</Text>
                </AnalyseRow>
              )}
            </div>
            <AnalyseRow style={{ backgroundColor: '#009172', color: '#fff', padding: '1rem ' }}>
              <Text>
                {resultData.studentRank}. {studentResult.student.user?.name}{' '}
                {studentResult.student.user?.surname}
              </Text>
              <Text>{studentResult.overallScore}</Text>
            </AnalyseRow>
          </AnalyseByTheme>
        </AnalyseTopContent>
        <ChartCont>
          <PointChart style={{ width: '100%' }} chartData={chartData} />
        </ChartCont>
      </div>
    </>
  );
};
