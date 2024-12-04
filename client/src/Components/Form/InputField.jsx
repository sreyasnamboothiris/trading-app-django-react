import React from 'react'
import { Controller } from 'react-hook-form';

function InputField({ control, name, type, placeholder, rules }) {
  return (
    <div className='flex flex-col'>
    <div className='flex flex-col'>
    <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <input
            {...field}
            className='text-white text-center rounded-s-md bg-[#1A3B5D]'
            type={type}
            placeholder={placeholder}
          />
        )}
      />
      
    </div>
      </div>
    )
  }

export default InputField;
