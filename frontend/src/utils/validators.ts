export const emailValidator = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const passwordValidator = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const plateValidator = (plate: string): boolean => {
  // Validation simple pour les plaques françaises
  const regex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  return regex.test(plate.toUpperCase());
};