import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import accountCircleImg from '../../assets/imgs/account_circle.png';
import passwordImg from '../../assets/imgs/password.jpg';
import navigationImg1 from '../../assets/imgs/navigation.png';
import navigationImg2 from '../../assets/imgs/navigation.png';
import editImg from '../../assets/imgs/edit.png';
import hiddenImg from '../../assets/imgs/hidden.png';
import visibilityImg from '../../assets/imgs/visibility.png';
import { LanguageContext } from '../../contexts/LanguageContext';
import './GeneralProfile.css';

import { Modal, Button, Form, Input, Select } from 'antd';

import Loader from '../../components/organism/Loader/Loader';

const GeneralProfile = () => {
  const [data, setData] = useState({});
  const [parsedData, setParsedData] = useState('');

  const [activeSection, setActiveSection] = useState('personalInfo');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inn, setInn] = useState('');
  const [visibility, setVisibility] = useState({
    pass1: { visible: false },
    pass2: { visible: false },
    pass3: { visible: false }
  });
  const [focused, setFocused] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLiteral, setSelectedLiteral] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');

  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);

  let parsed;
  const profession_id = parsedData.secondId;

  async function fetchSubjects() {
    setLoading(true);
    try {
      const response = await axios.get('https://ubt-server.vercel.app/subjects/');
      console.log('Fetched subjects:', response.data); // Added console log for fetched subjects
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error); // Improved error handling
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user_data = localStorage.getItem('user_data');
    setParsedData(JSON.parse(user_data));
    parsed = JSON.parse(user_data);
    console.log('parsed', parsed);

    let response;

    async function getData() {
      setLoading(true);
      try {
        switch (parsed.role) {
          case 'admin':
            response = await axios.get(`https://ubt-server.vercel.app/admins/${parsed.secondId}`);
            setData(response.data);
            break;
          case 'teacher':
            response = await axios.get(
              `https://ubt-server.vercel.app/adminTeacher/${parsed.secondId}`
            );
            const { user, class: classInfo } = response.data;

            const responseSubject = await axios.get(
              `https://ubt-server.vercel.app/subjects/${response.data.subject}`
            );
            console.log('subject', responseSubject.data);
            let teacherSubject;
            language == 'kz'
              ? (teacherSubject = responseSubject.data.kz_subject)
              : (teacherSubject = responseSubject.data.ru_subject);
            setData({
              email: user.email,
              name: user.name,
              surname: user.surname,
              password: user.password,
              class: classInfo.class,
              literal: classInfo.literal,
              subject: teacherSubject
            });
            localStorage.setItem('teacherSubject', response.data.subject);
            break;
          case 'student':
            response = await axios.get(
              `https://ubt-server.vercel.app/adminStudent/${parsed.secondId}`
            );
            const { user: studentUser, class: studentClassInfo } = response.data;
            console.log('response');
            setData({
              email: studentUser.email,
              name: studentUser.name,
              surname: studentUser.surname,
              password: studentUser.password,
              class: studentClassInfo.class,
              literal: studentClassInfo.literal,
              subject: response.data.subject,
              inn: response.data.inn
            });
            break;
          default:
            console.error('There is an error when parsing the role');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }

    fetchSubjects();
    getData();
  }, []);

  async function handleUpdateProfile() {
    setLoading(true);
    let updatedUserData;

    console.log('parsedRole', parsedData.role);

    switch (parsedData.role) {
      case 'admin':
        updatedUserData = {
          name: name,
          surname: surname,
          email: email
        };
        break;
      case 'teacher':
        updatedUserData = {
          name: name,
          surname: surname,
          email: email,
          classNum: selectedGroup,
          literal: selectedLiteral,
          subjectId: subjectId
        };
        break;
      case 'student':
        updatedUserData = {
          name: name,
          surname: surname,
          email: email,
          classNum: data.class,
          literal: data.literal,
          inn: data.inn
        };
      default:
        break;
    }

    console.log('updated: ', updatedUserData);

    let response;

    try {
      switch (parsedData.role) {
        case 'admin':
          response = await axios.put(
            `https://ubt-server.vercel.app/admins/profile/${profession_id}`,
            updatedUserData
          );
          console.log('Profile updated successfully', response.data);
          setModalOpen(false);
          break;
        case 'teacher':
          response = await axios.put(
            `https://ubt-server.vercel.app/adminteacher/${profession_id}`,
            updatedUserData
          );
          console.log('Profile updated successfully', response.data);
          setModalOpen(false);
          break;
        case 'student':
          response = await axios.put(
            `https://ubt-server.vercel.app/adminStudent/${profession_id}`,
            updatedUserData
          );
          console.log('Profile updated successfully', response.data);
          setModalOpen(false);
          break;
        default:
          console.error('Your role is not defined');
          alert('Your role is not defined');
          break;
      }
    } catch (error) {
      console.error(error);
      // alert(error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  async function handleUpdatePassword() {
    setLoading(true);
    let updatedPassword;
    switch (parsedData.role) {
      case 'admin':
        updatedPassword = {
          oldPassword: currentPassword,
          newPassword: newPassword
        };
        break;
      case 'teacher':
        updatedPassword = {
          oldPassword: currentPassword,
          password: newPassword
        };
        break;
      case 'student':
        updatedPassword = {
          inn: inn,
          password: newPassword
        };
      default:
        break;
    }

    console.log('updated: ', updatedPassword);

    let response;

    try {
      switch (parsedData.role) {
        case 'admin':
          response = await axios.put(
            `https://ubt-server.vercel.app/admins/password/${profession_id}`,
            updatedPassword
          );
          console.log('Password updated successfully', response.data);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setModalOpen(false);
          break;
        case 'teacher':
          response = await axios.put(
            `https://ubt-server.vercel.app/teachers/password/${profession_id}`,
            updatedPassword
          );
          console.log('Password updated successfully', response.data);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setModalOpen(false);
          break;
        case 'student':
          response = await axios.put(
            `https://ubt-server.vercel.app/students/${profession_id}`,
            updatedPassword
          );
          console.log('Password updated successfully');
          setNewPassword('');
          setInn('');
          setModalOpen(false);
          break;
        default:
          console.error('Your role is not defined');
          alert('Your role is not defined');
          break;
      }
    } catch (error) {
      console.error(error);
      // alert(error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  const handleVisibility = (inputName) => {
    setVisibility((prevPasswords) => ({
      ...prevPasswords,
      [inputName]: {
        ...prevPasswords[inputName],
        visible: !prevPasswords[inputName].visible
      }
    }));
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword || parsedData.role === 'student') {
      handleUpdatePassword();
    } else {
      console.log('Passwords do not match!');
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const profileSubmit = () => {
    isModalOpen(false);
  };

  const generateClassNumbers = () => {
    return Array.from({ length: 7 }, (_, index) => ({
      value: (11 - index).toString(),
      label: (11 - index).toString()
    }));
  };

  return (
    <>
      {loading && <Loader />}
      <Modal title="Обновить профиль" visible={isModalOpen} onCancel={closeModal} footer={[]}>
        <Form
          variant="filled"
          onFinish={handleUpdateProfile}
          style={{
            padding: '2rem 0'
          }}
        >
          <Form.Item
            name="name"
            label="Имя"
            rules={[
              {
                required: true,
                message: 'Please input your full name!'
              }
            ]}
          >
            <div className="input_group">
              <Input
                id="name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
                className="form_input"
              />
            </div>
          </Form.Item>

          <Form.Item
            name="surname"
            label="Фамилия"
            rules={[
              {
                required: true,
                message: 'Please input your surname!'
              }
            ]}
          >
            <div className="input_group">
              <Input
                id="surname_input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder=""
                className="form_input"
              />
            </div>
          </Form.Item>

          <Form.Item
            name="email"
            label="Почта"
            rules={[
              {
                required: true,
                message: 'Please input your email!'
              }
            ]}
          >
            <div className="input_group">
              <Input
                id="email_input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="form_input"
              />
            </div>
          </Form.Item>
          {parsedData.role === 'teacher' ? (
            <div className="class_literal">
              <Form.Item
                name="class"
                rules={[
                  {
                    required: true,
                    message: 'Please input!'
                  }
                ]}
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
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Выберите литерал"
                  value={selectedLiteral}
                  onChange={(e) => setSelectedLiteral(e.target.value.toLowerCase())}
                  maxLength={1}
                />
              </Form.Item>
              <Form.Item label="Предмет" name="subjectId">
                <Select
                  placeholder="Выберите предмет"
                  value={subjectId}
                  onChange={(value) => setSubjectId(value)}
                  className="modalSelect"
                >
                  {subjects.map((subject) => (
                    <Option key={subject._id} value={subject._id}>
                      {language === 'kz' ? subject.kz_subject : subject.ru_subject}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          ) : (
            ''
          )}

          <Form.Item>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={closeModal} className="submit" type="" htmlType="cancel">
                Cancel
              </Button>
              <Button className="submit" type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <div className="general">
        <nav>
          <div className="nav1">
            <button onClick={() => setActiveSection('personalInfo')}>
              <img src={accountCircleImg} />
              <p>{language == 'kz' ? 'Жеке мәліметтер' : 'Персональная информация'}</p>
              <img src={navigationImg1} />
            </button>
          </div>
          <div className="nav2">
            <button onClick={() => setActiveSection('updatePassword')}>
              <img src={passwordImg} />
              <p>{language == 'kz' ? 'Құпия сөзді жаңарту' : 'Обновить пароль'}</p>
              <img src={navigationImg2} />
            </button>
          </div>
        </nav>

        {activeSection === 'personalInfo' && (
          <div>
            <div className="personal-info-container">
              <hr />
              <div className="personal">
                <div className="personal-info-header">
                  <p>{language == 'kz' ? 'Жеке мәліметтер' : 'Персональная информация'}</p>
                  <img onClick={openModal} src={editImg} />
                </div>
                <div className="personal-info-grid">
                  <div className="info-box">
                    <div className="info-label">
                      {language == 'kz' ? 'Аты-жөні' : 'Имя-фамилия'}
                    </div>
                    <div className="info-value">
                      {data.name} {data.surname}
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-label">{language == 'kz' ? 'Пошта' : 'Почта'}</div>
                    <div className="info-value">{data.email}</div>
                  </div>
                  {parsedData.role === 'admin' ? (
                    ''
                  ) : (
                    <>
                      {parsedData.role === 'teacher' ? (
                        ''
                      ) : (
                        <div className="info-box">
                          <div className="info-label">{language == 'kz' ? 'ЖСН' : 'ИИН'}</div>
                          <div className="info-value">{data.inn}</div>
                        </div>
                      )}
                      <div className="info-box">
                        <div className="info-label">Класс</div>
                        <div className="info-value">{data.class}</div>
                      </div>
                      <div className="info-box">
                        <div className="info-label">Литерал</div>
                        <div className="info-value">{data.literal}</div>
                      </div>
                      {parsedData.role === 'student' ? (
                        ''
                      ) : (
                        <div className="info-box">
                          <div className="info-label">{language == 'kz' ? 'Пән' : 'Предмет'}</div>
                          <div className="info-value">{data.subject}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'updatePassword' && (
          <div className="updatePasswordGeneral">
            <hr />
            <div className="password-update-container">
              <p className="password-update-header">
                {language == 'kz' ? 'Құпия сөзді жаңарту' : 'Обновить пароль'}
              </p>
              <form onSubmit={handleSubmitPassword} className="password-update-form">
                {parsedData.role === 'student' ? (
                  ''
                ) : (
                  <div
                    className={`form-group ${
                      focused.currentPassword || currentPassword ? 'focused' : ''
                    }`}
                  >
                    <input
                      id="current-password"
                      type={visibility.pass1.visible ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <img
                      onClick={() => handleVisibility('pass1')}
                      src={visibility.pass1.visible == false ? hiddenImg : visibilityImg}
                    />
                    <label htmlFor="current-password">
                      {language == 'kz' ? 'Қазіргі құпия сөз' : 'Текущий пароль'}*
                    </label>
                  </div>
                )}
                <div
                  className={`form-group ${focused.newPassword || newPassword ? 'focused' : ''}`}
                >
                  <input
                    id="new-password"
                    type={visibility.pass2.visible ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <img
                    onClick={() => handleVisibility('pass2')}
                    src={visibility.pass2.visible == false ? hiddenImg : visibilityImg}
                  />
                  <label htmlFor="newPassword">
                    {language == 'kz' ? 'Жаңа құпия сөз' : 'Новый пароль'}*
                  </label>
                </div>
                {parsedData.role === 'student' ? (
                  <div className={`form-group ${focused.inn || inn ? 'focused' : ''}`}>
                    <input
                      id="inn"
                      // type={visibility.pass1.visible ? 'text' : 'password'}
                      value={inn}
                      onChange={(e) => setInn(e.target.value)}
                    />
                    <label htmlFor="inn">{language == 'kz' ? 'ЖСН' : 'ИИН'}*</label>
                  </div>
                ) : (
                  <div
                    className={`form-group ${
                      focused.confirmPassword || confirmPassword ? 'focused' : ''
                    }`}
                  >
                    <input
                      id="confirm-password"
                      type={visibility.pass3.visible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <img
                      onClick={() => handleVisibility('pass3')}
                      src={visibility.pass3.visible == false ? hiddenImg : visibilityImg}
                    />
                    <label htmlFor="confirmPassword">
                      {language == 'kz' ? 'Құпия сөзді қайталау' : 'Потвердите пароль'}*{' '}
                    </label>
                  </div>
                )}

                <button type="submit">{language == 'kz' ? 'Өзгерту' : 'Изменить'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralProfile;
