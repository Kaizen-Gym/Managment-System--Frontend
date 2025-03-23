export const validators = {
  name: (value) => {
    const regex = /^[a-zA-Z\s]{2,50}$/;
    if (!value) return "Name is required";
    if (!regex.test(value)) return "Name should be 2-50 characters long and contain only letters";
    return null;
  },

  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required";
    if (!regex.test(value)) return "Invalid email format";
    return null;
  },

  phone: (value) => {
    const regex = /^\d{10}$/;
    if (!value) return "Phone number is required";
    if (!regex.test(value)) return "Phone number should be 10 digits";
    return null;
  },

  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(value)) return "Password must contain at least one special character";
    return null;
  },

  age: (value) => {
    if (!value) return "Age is required";
    if (isNaN(value) || value < 14 || value > 100) return "Age must be between 14 and 100";
    return null;
  },

  gender: (value) => {
    const validGenders = ["Male", "Female", "Other"];
    if (!value) return "Gender is required";
    if (!validGenders.includes(value)) return "Invalid gender selection";
    return null;
  },

  amount: (value) => {
    if (!value) return "Amount is required";
    if (isNaN(value) || value <= 0) return "Amount must be a positive number";
    return null;
  },

  date: (value) => {
    if (!value) return "Date is required";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Invalid date";
    return null;
  }
};

export const validateForm = (formData, fields) => {
  const errors = {};
  fields.forEach(field => {
    if (validators[field.type]) {
      const error = validators[field.type](formData[field.name]);
      if (error) errors[field.name] = error;
    }
  });
  return errors;
};