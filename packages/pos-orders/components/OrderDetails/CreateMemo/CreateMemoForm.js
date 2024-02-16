import { useFormContext } from 'react-hook-form';

export const CreateMemoForm = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};
