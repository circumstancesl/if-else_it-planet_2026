import { useState } from 'react';

export const useForm = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const setFieldError = (field, message) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    };

    const resetForm = () => {
        setFormData(initialState);
        setErrors({});
    };

    return {
        formData,
        errors,
        handleChange,
        setFieldError,
        resetForm
    };
};