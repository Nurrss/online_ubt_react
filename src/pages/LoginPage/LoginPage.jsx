import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES } from '../../App';
import { ErrorDisplay } from '../../components/organism/ErrorDisplay/ErrorDisplay';
import axios from 'axios';

import { Button, Form, Input, Space } from 'antd';

import styles from './LoginPage.module.css';

import Loader from '../../components/organism/Loader/Loader';

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedRole = location.state?.selectedRole || {};

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  async function onFinish() {
    setLoading(true);
    try {
      const loginData = { email, password }; // Combine email and password
      const response = await axios.post('https://ubt-server.vercel.app/auth', loginData, {
        headers: {
          'Content-Type': 'application/json' // Set content type header
        }
      });
      console.log(response.data);
      const userRole = response.data.role;

      if (selectedRole !== userRole) {
        alert(`You will be redirected to ${userRole} page`);
      }

      localStorage.setItem('user_data', JSON.stringify(response.data));

      // onLogin()

      switch (userRole) {
        case ROLES.Student:
          navigate('/exams');
          break;
        case ROLES.Teacher:
          navigate('/my_class');
          break;
        case ROLES.Admin:
          navigate('/exams_admin');
          break;
        default:
          navigate('*');
          alert('Your role is not defined');
          break;
      }

      window.location.reload();
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error(error.message);
        setErrorMessage(error.message);
      } else {
        console.error(error.response.data.message);
        setErrorMessage(error.response.data.message);
      }
      // Log backend error response
    } finally {
      setLoading(false); // Stop loading
    }
  }

  return (
    <>
      {loading && <Loader />}
      <div className={styles.login_container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Войти</h2>
          <p className={styles.welcome_text}>Добро пожаловать!</p>
        </div>
        <div className="form">
          {errorMessage && <ErrorDisplay errorMessage={errorMessage} />}
          <Form
            variant="filled"
            onFinish={onFinish}
            style={{
              maxWidth: 600
            }}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!'
                }
              ]}
            >
              <div className="input_group">
                <Input
                  placeholder=""
                  onChange={handleEmailChange}
                  className={styles.form_input}
                  autoComplete="off"
                />
                <label className={styles.form_input_label}>Email*</label>
              </div>
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]}
            >
              <div className="input_group">
                <Input.Password
                  placeholder=""
                  onChange={handlePasswordChange}
                  className={styles.form_input}
                  autoComplete="off"
                />
                <label className={styles.form_input_label}>Password*</label>
              </div>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button className={styles.submit} type="primary" htmlType="submit">
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};
