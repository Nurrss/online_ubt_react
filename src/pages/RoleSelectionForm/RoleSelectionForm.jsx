import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelectionForm.css';
import { FilterChoose } from '../../components/atoms/FilterChoose/FilterChoose';
import { filterPage } from '../../data/page_text';

import Loader from '../../components/organism/Loader/Loader';

export const RoleSelectionForm = ({ onSelect, selectedRole }) => {
  const [loading, setLoading] = useState(false);
  // const [role, setRole] = useState("");

  const navigate = useNavigate(); // Instantiate the navigation function

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    navigate('/login');
    navigate('/login', { state: { selectedRole: selectedRole } });
    setLoading(false);
  };

  // const handleDataFromChild = (childData) => {
  //   setRole(childData);
  // };

  <submit className="on">
    Role
    <Selection-Form></Selection-Form>
  </submit>;

  return (
    <>
      {loading && <Loader />}
      <div className="role-selection-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2>{filterPage.title}</h2>
          <p>{filterPage.miniTitle}</p>
        </div>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          onSubmit={handleSubmit}
        >
          <FilterChoose onSelect={onSelect} selectedRole={selectedRole} />
          <button type="submit" className="filter-button">
            {filterPage.logInText}
          </button>
        </form>
      </div>
    </>
  );
};
