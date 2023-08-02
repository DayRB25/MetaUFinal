const validateNonEmptyFields = (
  firstname,
  lastname,
  username,
  email,
  password,
  year,
  city,
  state,
  address
) => {
  if (
    firstname === "" ||
    lastname === "" ||
    username === "" ||
    email === "" ||
    password === "" ||
    year === "" ||
    city === "" ||
    state === "" ||
    address === ""
  ) {
    return false;
  }
  return true;
};

const validateEmail = (email) => {
  // Check if the email contains an '@' symbol
  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return false;
  }

  // Check if the email contains a domain (characters after the '@' symbol)
  const domain = email.slice(atIndex + 1);
  if (!domain) {
    return false;
  }

  // Check if the domain contains a period
  const periodIndex = domain.indexOf(".");
  if (periodIndex === -1) {
    return false;
  }

  // Check if the domain has at least one character before the period
  const domainName = domain.slice(0, periodIndex);
  if (!domainName) {
    return false;
  }

  // Check if the domain has at least two characters after the period
  const topLevelDomain = domain.slice(periodIndex + 1);
  if (!topLevelDomain || topLevelDomain.length < 2) {
    return false;
  }

  // All checks passed, email is valid
  return true;
};

const validatePassword = (password) => {
  if (password.length < 8) return false;
  const specialCharacters = new Set(["!", "@", "#", "$", "%", "^", "&", "*"]);
  const upperCaseA_Ascii = 65;
  const upperCaseZ_Ascii = 90;
  // validate presence of uppercase letter and special character
  let hasUpperCase = false;
  let hasSpecialCharacter = false;
  for (let i = 0; i < password.length; i++) {
    // if the character @ idx i's ascii value is within this range, it must be a capital letter
    if (
      password.charCodeAt(i) >= upperCaseA_Ascii &&
      password.charCodeAt(i) <= upperCaseZ_Ascii
    ) {
      hasUpperCase = true;
    }
    if (specialCharacters.has(password[i])) {
      hasSpecialCharacter = true;
    }
  }

  return hasSpecialCharacter && hasUpperCase;
};

const validateYear = (year) => {
  // regex test ensures year only contains digit and parseInt restricts min value of year
  if (!/^\d+$/.test(year) || parseInt(year) <= 0) {
    return false;
  }
  return true;
};

const validateCity = (city) => {
  if (/\d/.test(city)) {
    return false;
  }
  return true;
};

const validateState = (state) => {
  const commonStateAbbreviatonLength = 2;
  if (/\d/.test(state) || state.length <= commonStateAbbreviatonLength) {
    return false;
  }
  return true;
};

export {
  validateEmail,
  validatePassword,
  validateState,
  validateCity,
  validateNonEmptyFields,
  validateYear,
};
