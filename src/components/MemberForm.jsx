import { useState } from 'react';
import { validateForm } from '../utils/validation';
import { memberService } from '../services/api';
import { resetCsrfToken } from '../utils/csrf';

const MemberForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData, [
      { name: 'name', type: 'name' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'age', type: 'age' },
      { name: 'gender', type: 'gender' },
    ]);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Replace direct API call with memberService
      const response = await memberService.addMember(formData);
      // ...handle success...
    } catch (error) {
      if (error.response?.status === 403) {
        // CSRF token expired or invalid
        resetCsrfToken();
        // Retry the request
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}
      </div>
      {/* Add similar validation for other fields */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default MemberForm;
