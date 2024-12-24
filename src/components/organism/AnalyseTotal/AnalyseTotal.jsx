import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Text } from '../../atoms/CustomText/CustomText';
import { colors } from '../../../base/colors';
import { ColumnChart } from '../../../pages/ColumnChart';
import { CustomButton } from '../../atoms/CustomButton/CustomButton';
import axios from 'axios';
import styles from './AnalyseTotal.module.css';
import Loader from '../Loader/Loader';
import { useLocation } from 'react-router-dom';

const ChangeButton = styled.button`
  color: #000;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  width: min-content;
  background-color: unset;
`;

export const AnalyseTotal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filterBy, setFilterBy] = useState('subject');
  const [searchBy, setSearchBy] = useState('name');

  const location = useLocation();
  const examId = location.state?.examId || {};
  const itemsPerPage = 10;

  async function fetchClasses() {
    setLoading(true);
    try {
      const response = await axios.get(`https://ubt-server.vercel.app/class`);
      setClasses(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('https://ubt-server.vercel.app/subjects/');
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
    fetchClasses();
  }, []);

  async function getAllResultForExam() {
    setLoading(true);
    const filterData = {
      examId: examId
    };
    try {
      const response = await axios.post(
        'https://ubt-server.vercel.app/admins/getAllResultForExam',
        filterData
      );
      console.log(response.data);
      setExamResults(response.data.results);
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllResultForExam();
  }, []);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleSearchTypeChange = (type) => {
    setSearchBy(type);
  };

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClasses(e.target.value);
  };

  const filteredAndSortedStudents = examResults
    .filter((student) => {
      if (searchBy === 'name') {
        return `${student.student.name} ${student.student.surname}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      if (searchBy === 'className') {
        return student.student.className.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => b.overallScore - a.overallScore);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAndSortedStudents.length);
  const visibleData = filteredAndSortedStudents.slice(startIndex, endIndex);
  const rangeText = `${startIndex + 1}-${endIndex} из ${filteredAndSortedStudents.length}`;

  const top10BySubject = selectedSubject
    ? examResults
        .filter((student) => student.subjects.some((subject) => subject.name === selectedSubject))
        .sort((a, b) => {
          const scoreA =
            a.subjects.find((subject) => subject.name === selectedSubject)?.totalPoints || 0;
          const scoreB =
            b.subjects.find((subject) => subject.name === selectedSubject)?.totalPoints || 0;
          return scoreB - scoreA;
        })
        .slice(0, 10)
    : examResults.slice(0, 10);

  const top10ByClass = selectedClasses
    ? examResults
        .filter((student) => student.student.className === selectedClasses)
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 10)
    : examResults.slice(0, 10);

  return (
    <>
      {loading && <Loader />}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '2rem' }}>
        <div className={styles.titleContainer}>
          <Text fontSize="30px" weight="bold">
            Анализ экзамена
          </Text>
        </div>
        {metrics ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', padding: '1rem' }}>
            <div className={styles.twoTextButton}>
              <Text>Средний балл</Text>
              <Text>{!isNaN(metrics.averageScore) ? Math.round(metrics.averageScore) : `0`}</Text>
              {console.log('metrics', metrics)}
            </div>
            <div className={styles.twoTextButton}>
              <Text>Средний процент</Text>
              <Text>
                {!isNaN(metrics.averagePercent) ? Math.round(metrics.averagePercent) : `0`}%
              </Text>
            </div>
            <div className={styles.twoTextButton}>
              <Text>Количество участников</Text>
              <Text>{metrics.totalStudents}</Text>
            </div>
          </div>
        ) : (
          <Text>Loading metrics...</Text>
        )}
        <div>
          <label htmlFor="subjectFilter">Фильтр по предмету: </label>
          <select id="subjectFilter" value={selectedSubject} onChange={handleSubjectChange}>
            <option value="">Все предметы</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject.kz_subject}>
                {subject.kz_subject}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="classFilter">Фильтр по классу: </label>
          <select id="classFilter" value={selectedClasses} onChange={handleClassChange}>
            <option value="">Все классы</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem.class + classItem.literal}>
                {classItem.class + classItem.literal}
              </option>
            ))}
          </select>
        </div>
        <ColumnChart data={selectedSubject ? top10BySubject : top10ByClass} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.tableHeader}>
            <div className={styles.twoElementContainer}>
              <input
                style={{ padding: '0 1rem', borderRadius: '0.5rem' }}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search by name"
              />
              <CustomButton
                bgColor={colors.white}
                color={colors.black}
                onClick={handleSearch}
                width="7rem"
              >
                Искать
              </CustomButton>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSearchTypeChange('name')}
                  style={{
                    backgroundColor: searchBy === 'name' ? colors.primary : colors.lightGray,
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    color: colors.white
                  }}
                >
                  Имя
                </button>
                <button
                  onClick={() => handleSearchTypeChange('className')}
                  style={{
                    backgroundColor: searchBy === 'className' ? colors.primary : colors.lightGray,
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    color: colors.white
                  }}
                >
                  Класс
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.5rem',
              alignItems: 'end',
              backgroundColor: '#f7f7f7',
              borderRadius: '0 0 1rem 1rem',
              padding: '1rem'
            }}
          >
            <div className="container">
              <div className="row table_row">
                <div className="col-1 table_items">#</div>
                <div className="col-3 table_items">Имя фамилия</div>
                <div className="col-2 table_items">Средний балл</div>
                <div className="col-2 table_items">Класс</div>
                <div className="col-4 table_items">Баллы по предметам</div>
              </div>
              {visibleData.map((studentData, index) => (
                <React.Fragment key={index}>
                  <div className="row table_row">
                    <div className="col-1 table_items">{startIndex + index + 1}</div>
                    <div className="col-3 table_items">{`${studentData.student.name} ${studentData.student.surname}`}</div>
                    <div className="col-2 table_items">{studentData.overallScore}</div>
                    <div className="col-2 table_items">{studentData.student.className}</div>
                    <div className="col-4 table_items">
                      {studentData.subjects.map((subject, subIndex) => (
                        <div key={subIndex} className={styles.subject_item}>
                          <strong>{subject.name}:</strong>{' '}
                          <span className={styles.subject_points}>{subject.totalPoints}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Text>{rangeText}</Text>
              <ChangeButton onClick={handlePrevPage} disabled={currentPage === 0}>
                {'<'}
              </ChangeButton>
              <ChangeButton
                onClick={handleNextPage}
                disabled={endIndex >= filteredAndSortedStudents.length || visibleData.length === 0}
              >
                {'>'}
              </ChangeButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
