export const onInputNoSpecialChars = (e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z0-9]/g, "");
};

export const onInputUppercase = (e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.value = e.currentTarget.value.toUpperCase();
}
