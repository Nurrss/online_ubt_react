import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { colors } from '../../base/colors';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Modal, Button, Form, Input, Select } from 'antd';
import styles from './TeachersTable.module.css';
import axios from 'axios';
import config from '../../../config';

import { LanguageContext } from '../../contexts/LanguageContext';
import Loader from '../../components/organism/Loader/Loader';

const { Option } = Select;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${colors.gray};
`;

const ChangePageButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: ${colors.white};
  color: ${colors.black};
  border: 1px solid ${colors.gray};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const ActiveButton = styled.button`
  border-radius: 0.3rem;
  padding: 0.5rem;
  color: ${(props) => (props.active ? '#fff' : '#000')};
  background-color: ${(props) => (props.active ? '#091' : '#fff')};
  border: solid 1px gray;
  cursor: pointer;

  @media (max-width: 1000px) {
    width: max-content;
  }
`;

export const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [subjects, setSubjects] = useState([]);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState({});
  const [email, setEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLiteral, setSelectedLiteral] = useState('');

  const [searchMode, setSearchMode] = useState('fullname');

  const itemsPerPage = 10;

  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const response = await axios.get('https://ubt-server.vercel.app/adminTeacher/');
      console.log('admin teacher: ', response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false); // Stop loading
    }
  }

  async function fetchSubjects() {
    setLoading(true);
    try {
      const response = await axios.get(`${config.baseURL}/subjects/`);
      setSubjects(response.data);
      console.log('subjects', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  useEffect(() => {
    async function fetchData() {
      const data = await fetchTeachers();
      setTeachers(data);
    }

    fetchData();
    fetchSubjects();
  }, []);

  async function handleUpdateTeacher() {
    setLoading(true);

    const originalTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId);

    // Original teacher data
    const originalName = originalTeacher?.name || '';
    const originalSurname = originalTeacher?.surname || '';
    const originalFullName = `${originalName} ${originalSurname}`.trim();
    const originalSubjectId = originalTeacher?.subjectId;

    // New teacher data
    const newName = name || originalName;
    const newSurname = surname || originalSurname;
    const newFullName = `${newName} ${newSurname}`.trim();
    const newSubjectId = selectedSubject || originalSubjectId;

    const isNameChanged = newName !== originalName || newSurname !== originalSurname;
    const isSubjectChanged = newSubjectId !== originalSubjectId;

    const updatedTeacherData = {
      name: newName,
      surname: newSurname,
      subjectId: newSubjectId,
      email: email || originalTeacher.email,
      classNum: selectedGroup || originalTeacher.classNum,
      literal: selectedLiteral || originalTeacher.literal
    };

    if (!newSubjectId) {
      setLoading(false);
      return alert('Select a subject');
    }

    try {
      // Update teacher data
      await axios.put(
        `https://ubt-server.vercel.app/adminTeacher/${selectedTeacherId}`,
        updatedTeacherData
      );
      console.log('Teacher updated successfully');

      // Fetch the original subject data
      const originalSubject = subjects.find((subject) => subject._id === originalSubjectId);
      const originalKzSubject = originalSubject?.kz_subject || '';
      const originalRuSubject = originalSubject?.ru_subject || '';

      // Check if the teacher's name is included in the subject's name
      const isTeacherNameInKzSubject = originalKzSubject.includes(`(${originalFullName})`);
      const isTeacherNameInRuSubject = originalRuSubject.includes(`(${originalFullName})`);

      // If the teacher's name is changed and it's included in the subject's name
      if (isNameChanged && (isTeacherNameInKzSubject || isTeacherNameInRuSubject)) {
        // Update the subject's name to include the new teacher's name
        const updatedKzSubject = originalKzSubject.replace(
          `(${originalFullName})`,
          `(${newFullName})`
        );
        const updatedRuSubject = originalRuSubject.replace(
          `(${originalFullName})`,
          `(${newFullName})`
        );

        const updatedSubjectData = {
          kz_subject: updatedKzSubject,
          ru_subject: updatedRuSubject
        };

        await axios.put(
          `https://ubt-server.vercel.app/subjects/${originalSubjectId}`,
          updatedSubjectData
        );
        console.log('Subject updated successfully with new teacher name');
      }

      // If the subject is changed, and the original subject includes the teacher's name,
      // update the original subject to remove the teacher's name
      if (isSubjectChanged && (isTeacherNameInKzSubject || isTeacherNameInRuSubject)) {
        const updatedKzSubject = originalKzSubject.replace(`(${originalFullName})`, '').trim();
        const updatedRuSubject = originalRuSubject.replace(`(${originalFullName})`, '').trim();

        const updatedSubjectData = {
          kz_subject: updatedKzSubject,
          ru_subject: updatedRuSubject
        };

        await axios.put(
          `https://ubt-server.vercel.app/subjects/${originalSubjectId}`,
          updatedSubjectData
        );
        console.log('Original subject updated to remove teacher name');
      }

      // If the subject is changed, update the new subject to include the teacher's name
      if (isSubjectChanged) {
        const newSubject = subjects.find((subject) => subject._id === newSubjectId);
        const newKzSubject = newSubject?.kz_subject || '';
        const newRuSubject = newSubject?.ru_subject || '';

        const updatedKzSubject = `${newKzSubject} (${newFullName})`;
        const updatedRuSubject = `${newRuSubject} (${newFullName})`;

        const updatedSubjectData = {
          kz_subject: updatedKzSubject,
          ru_subject: updatedRuSubject
        };

        await axios.put(
          `https://ubt-server.vercel.app/subjects/${newSubjectId}`,
          updatedSubjectData
        );
        console.log('New subject updated with teacher name');
      }

      const updatedData = await fetchTeachers();
      setTeachers(updatedData);
      setEditModalVisible(false);
      setSelectedTeacherId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubject(subjectId) {
    setLoading(true);
    try {
      const response = await axios.get(`https://ubt-server.vercel.app/subjects/${subjectId}`);
      console.log('selectedSubject', response.data);
      setSelectedSubjectName({
        kzName: response.data.kz_subject,
        ruName: response.data.ru_subject
      });
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false); // Stop loading
    }
  }

  const selectSubject = (subjectId) => {
    fetchSubject(subjectId);
    setSelectedSubject(subjectId);
  };

  const generateClassNumbers = () => {
    return Array.from({ length: 7 }, (_, index) => ({
      value: (11 - index).toString(),
      label: (11 - index).toString()
    }));
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://ubt-server.vercel.app/adminTeacher/');
      setTeachers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  async function handleDeleteTeacher(teacherId) {
    setLoading(true);
    try {
      const response = await axios.delete(
        `https://ubt-server.vercel.app/adminTeacher/${teacherId}`
      );
      console.log('Teacher deleted successfully', response.data);
      const updatedData = await fetchTeachers();
      setTeachers(updatedData);
      setEditModalVisible(false);
      setSelectedTeacherId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    if (searchMode === 'fullname') {
      const fullName = `${teacher.name} ${teacher.surname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    } else if (searchMode === 'group') {
      return teacher.group?.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchMode === 'subject') {
      return teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchMode === 'gmail') {
      return teacher.email?.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTeachers.length);
  const visibleData = filteredTeachers.slice(startIndex, endIndex);

  const searchByMode = (mode) => {
    setSearchMode(mode);
  };

  const handleInputSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const showAddModal = () => {
    clearInputFields();
    setAddModalVisible(true);
  };

  const handleAddModalCancel = () => {
    setAddModalVisible(false);
  };

  const showEditTeacher = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setEditModalVisible(true);

    const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId);

    // Update the state with the data of the selected student
    if (selectedTeacher) {
      setName(selectedTeacher.name);
      setSurname(selectedTeacher.surname);
      setSelectedSubject(selectedTeacher.subjectId);
      setEmail(selectedTeacher.email);
      setSelectedGroup(selectedTeacher.classNum);
      setSelectedLiteral(selectedTeacher.literal);
    }
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  async function handleSubmit() {
    setLoading(true);
    // Use the state variables to submit the form data or perform other actions
    const newTeacher = {
      name: name,
      surname: surname,
      subjectId: selectedSubject,
      email: email,
      classNum: selectedGroup,
      literal: selectedLiteral
    };
    console.log(newTeacher);

    try {
      const { data } = await axios.post(
        'https://ubt-server.vercel.app/adminTeacher/add',
        newTeacher,
        {
          headers: {
            'Content-Type': 'application/json' // Set content type header
          }
        }
      );
      const updatedData = await fetchTeachers();
      setTeachers(updatedData);
      console.log(data);
      setAddModalVisible(false);
      clearInputFields();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const clearInputFields = () => {
    setName('');
    setSurname('');
    setSelectedSubject(null);
    setEmail('');
    setSelectedGroup(null);
    setSelectedLiteral('');
  };

  return (
    <>
      {loading && <Loader />}
      <Modal
        title={language == 'kz' ? 'Мұғалім қосу' : 'Добавить учителя'}
        visible={addModalVisible}
        onCancel={handleAddModalCancel}
        footer={[]}
      >
        <Form
          variant="filled"
          style={{
            padding: '2rem 0'
          }}
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: 'Please input your full name!'
              }
            ]}
          >
            <div className={styles.input_group}>
              <Input
                id="name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                className={styles.form_input}
              />
              <label htmlFor="name_input" className={styles.form_input_label}>
                {language == 'kz' ? 'Аты' : 'Имя'}
              </label>
            </div>
          </Form.Item>

          <Form.Item
            name="surname"
            rules={[
              {
                required: true,
                message: 'Please input your surname!'
              }
            ]}
          >
            <div className={styles.input_group}>
              <Input
                id="surname_input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder=""
                className={styles.form_input}
              />
              <label htmlFor="surname_input" className={styles.form_input_label}>
                {language == 'kz' ? 'Тегі' : 'Фамилия'}
              </label>
            </div>
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!'
              }
            ]}
          >
            <div className={styles.input_group}>
              <Input
                id="email_input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className={styles.form_input}
              />
              <label htmlFor="email_input" className={styles.form_input_label}>
                Email*
              </label>
            </div>
          </Form.Item>

          <div className={styles.class_literal}>
            <Form.Item
              name="class"
              rules={[
                {
                  required: true,
                  message: 'Please input!'
                }
              ]}
              className={styles.form_select}
            >
              <Select
                style={{ width: '100%' }}
                value={selectedGroup}
                onChange={setSelectedGroup}
                placeholder="Выберите группу"
                allowClear
                dropdownStyle={{ maxHeight: 200, overflowY: 'auto' }}
              >
                {generateClassNumbers().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="literal"
              rules={[
                {
                  required: true,
                  message: 'Please input a single letter!'
                },
                {
                  pattern: /^[a-z]$/,
                  message: 'Literal must be a single lowercase letter!'
                }
              ]}
              className={styles.form_select}
            >
              <Input
                style={{ width: '100%' }}
                placeholder="Выберите литерал"
                value={selectedLiteral}
                onChange={(e) => setSelectedLiteral(e.target.value.toLowerCase())}
                maxLength={1}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <select
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.kz_subject}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                onClick={handleAddModalCancel}
                className={styles.submit}
                type=""
                htmlType="cancel"
              >
                {language == 'kz' ? 'Бас тарту' : 'Отмена'}
              </Button>
              <Button
                onClick={handleSubmit}
                className={styles.submit}
                type="primary"
                htmlType="submit"
              >
                {language == 'kz' ? 'Қабылдау' : 'Принять'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={language == 'kz' ? 'Мұғалім өзгерту' : 'Изменить учителя'}
        visible={editModalVisible}
        onCancel={handleEditModalCancel}
        footer={[]}
      >
        <Form
          variant="filled"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '.5rem',
            padding: '2rem 0'
          }}
          onFinish={handleUpdateTeacher}
        >
          <Form.Item name="name">
            <div className={styles.input_group}>
              <Input
                id="name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
              />
              <label htmlFor="name_input" className={styles.form_input_label}>
                {language == 'kz' ? 'Аты' : 'Имя'}
              </label>
            </div>
          </Form.Item>

          <Form.Item name="surname">
            <div className={styles.input_group}>
              <Input
                id="surname_input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder=""
              />
              <label htmlFor="surname_input" className={styles.form_input_label}>
                {language == 'kz' ? 'Тегі' : 'Фамилия'}
              </label>
            </div>
          </Form.Item>

          <Form.Item>
            <select
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={(e) => selectSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.kz_subject}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item name="email">
            <div className={styles.input_group}>
              <Input
                id="email_input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className={styles.form_input}
              />
              <label htmlFor="email_input" className={styles.form_input_label}>
                Email
              </label>
            </div>
          </Form.Item>

          {/* <div className={styles.class_literal}>
            <Form.Item name="class">
              <Select
                style={{ width: '100%' }}
                placeholder="Выберите группу"
                value={selectedGroup}
                onChange={setSelectedGroup}
                allowClear
                dropdownStyle={{ maxHeight: 200, overflowY: 'auto' }}
              >
                {generateClassNumbers().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="literal" className={styles.form_select}>
              <Input
                style={{ width: '100%' }}
                placeholder="Выберите литерал"
                value={selectedLiteral}
                onChange={(e) => setSelectedLiteral(e.target.value.toLowerCase())}
                maxLength={1}
              />
            </Form.Item>
          </div> */}
          <Form.Item>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'end' }}>
              <Button
                onClick={handleAddModalCancel}
                className={styles.submit}
                type=""
                htmlType="cancel"
              >
                {language == 'kz' ? 'Бас тарту' : 'Отказаться'}
              </Button>
              <Button className={styles.submit} type="primary" htmlType="submit">
                {language == 'kz' ? 'Қабылдау' : 'Принять'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <div>
        <Button onClick={showAddModal}>
          {language == 'kz' ? 'Мүғалім қосу' : 'Добавить учителя'}
        </Button>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.searchContainer}>
              <SearchInput
                className={styles.searchInput}
                type="text"
                value={searchQuery}
                onChange={handleInputSearchChange}
                placeholder={
                  language == 'kz' ? `${searchMode} арқылы іздеу` : `Искать по ${searchMode}`
                }
              />
              <div className={styles.searchContainer}>
                <ActiveButton
                  className={styles.searchBtn}
                  active={searchMode === 'fullname'} // Check if the button is active
                  onClick={() => searchByMode('fullname')} // Handle button click
                >
                  {language == 'kz' ? 'Толық аты-жөні' : 'Полное имя-фамилия'}
                </ActiveButton>
                <ActiveButton
                  className={styles.searchBtn}
                  active={searchMode === 'group'}
                  onClick={() => searchByMode('group')}
                >
                  {language == 'kz' ? 'Группа' : 'Группа'}
                </ActiveButton>
                <ActiveButton
                  className={styles.searchBtn}
                  active={searchMode === 'subject'}
                  onClick={() => searchByMode('subject')}
                >
                  {language == 'kz' ? 'ЖСН' : 'ИИН'}
                </ActiveButton>
                <ActiveButton
                  className={styles.searchBtn}
                  active={searchMode === 'gmail'}
                  onClick={() => searchByMode('gmail')}
                >
                  Gmail
                </ActiveButton>
              </div>
            </div>
            <ReloadOutlined onClick={handleReload} />
          </div>
          <div className={styles.tableCont}>
            {teachers.length <= 0 ? (
              <p>{language == 'kz' ? 'Әлі мұғалім жоқ' : 'Учителей еще нет'}</p>
            ) : (
              <div className={`${styles.teacherTable}`}>
                <div className={`row table_row ${styles.teacherRow}`}>
                  {/* <div class="col-2 table_items">ID</div> */}
                  <div className="col-2 table_items">{language == 'kz' ? 'Аты' : 'Имя'}</div>
                  <div className="col-2 table_items">{language == 'kz' ? 'Тегі' : 'Фамилия'}</div>
                  <div className="col-1 table_items">Группа</div>
                  <div className="col-2 table_items">{language == 'kz' ? 'Пән' : 'Предмет'}</div>
                  <div className="col-3 table_items">Gmail</div>
                </div>
                {visibleData.map((teacher, index) => (
                  <div key={index} className={`row table_row ${styles.studentsRow}`}>
                    {/* <div class="col-2 table_items">{student.id}</div> */}
                    <div className="col-2 table_items">{teacher.name}</div>
                    <div className="col-2 table_items">{teacher.surname}</div>
                    <div className="col-1 table_items">{teacher.group}</div>
                    <div className="col-2 table_items">{teacher.kz_subject}</div>
                    <div className="col-3 table_items">{teacher.email}</div>
                    <div className="col-1 table_items">
                      <div style={{ display: 'flex', gap: '2rem' }}>
                        <EditOutlined onClick={() => showEditTeacher(teacher.id)} />
                        <DeleteOutlined onClick={() => handleDeleteTeacher(teacher.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.pageController}>
            <ChangePageButton onClick={handlePrevPage} disabled={currentPage === 0}>
              {'<'}
            </ChangePageButton>
            <span>{`${currentPage + 1} / ${totalPages}`}</span>
            <ChangePageButton onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
              {'>'}
            </ChangePageButton>
          </div>
        </div>
      </div>
    </>
  );
};
