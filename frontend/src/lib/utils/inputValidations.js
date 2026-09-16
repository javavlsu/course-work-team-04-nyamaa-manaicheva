export const emailValidation = {
  type: 'email',
  name: 'email',
  label: 'Email',
  placeholder: 'Введите email',
  autoComplete: 'email',
  validation: {
    required: { value: true, message: 'Введите почту' },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Введите корректный email',
    },
    maxLength: { value: 100, message: 'Email не должен превышать 100 символов' },
  },
};

export const passwordValidation = {
  type: 'password',
  name: 'password',
  label: 'Пароль',
  placeholder: 'Введите пароль',
  autoComplete: 'current-password',
  validation: {
    required: { value: true, message: 'Введите пароль' },
    minLength: { value: 6, message: 'Пароль должен содержать минимум 6 символов' },
    maxLength: { value: 100, message: 'Пароль не должен превышать 100 символов' },
  },
};

export const firstNameValidation = {
  type: 'text',
  name: 'firstName',
  label: 'Имя',
  placeholder: 'Иван',
  autoComplete: 'given-name',
  validation: {
    required: { value: true, message: 'Введите имя' },
    maxLength: { value: 50, message: 'Имя не должно превышать 50 символов' },
  },
};

export const lastNameValidation = {
  type: 'text',
  name: 'lastName',
  label: 'Фамилия',
  placeholder: 'Иванов',
  autoComplete: 'family-name',
  validation: {
    required: { value: true, message: 'Введите фамилию' },
    maxLength: { value: 50, message: 'Фамилия не должна превышать 50 символов' },
  },
};

export const phoneValidation = {
  type: 'tel',
  name: 'phone',
  label: 'Телефон',
  placeholder: '+7 (900) 000-00-00',
  autoComplete: 'tel',
  validation: {
    pattern: {
      value: /^\+?[\d\s\-()]{7,18}$/,
      message: 'Введите корректный номер телефона',
    },
  },
};

export const registerPasswordValidation = {
  type: 'password',
  name: 'password',
  label: 'Пароль',
  placeholder: 'Минимум 8 символов',
  autoComplete: 'new-password',
  validation: {
    required: { value: true, message: 'Введите пароль' },
    minLength: { value: 8, message: 'Пароль должен содержать минимум 8 символов' },
    maxLength: { value: 100, message: 'Пароль не должен превышать 100 символов' },
  },
};

export const confirmPasswordValidation = {
  type: 'password',
  name: 'passwordConfirm',
  label: 'Повторите пароль',
  placeholder: 'Повторите пароль',
  autoComplete: 'new-password',
  validation: {
    required: { value: true, message: 'Повторите пароль' },
    validate: (value, formValues) =>
      value === formValues.password || 'Пароли не совпадают',
  },
};
