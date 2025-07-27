export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value);
    console.log(`setItem (web): ${key} : ${value}`);
  } catch (e) {
    console.error('setItem error (web)', e);
    throw e;
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    const value = localStorage.getItem(key);
    console.log(`getItem (web): ${key} => ${value}`);
    return value;
  } catch (e) {
    console.error('getItem error (web)', e);
    throw e;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key);
    console.log(`removeItem (web): ${key}`);
  } catch (e) {
    console.error('removeItem error (web)', e);
    throw e;
  }
};
